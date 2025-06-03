(function () {
  const REFINE_BUTTON_ID = "custom-refine-btn";
  let isRefining = false;

  const REFINE_SVG_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wand-sparkles-icon lucide-wand-sparkles">
        <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/>
        <path d="m14 7 3 3"/>
        <path d="M5 6v4"/>
        <path d="M19 14v4"/>
        <path d="M10 2v2"/>
        <path d="M7 8H3"/>
        <path d="M21 16h-4"/>
        <path d="M11 3H9"/>
    </svg>`;

  const LOADER_SVG_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle-icon lucide-loader-circle">
      <g>
        <animateTransform attributeName="transform"
                          attributeType="XML"
                          type="rotate"
                          from="0 12 12"
                          to="360 12 12"
                          dur="1s"
                          repeatCount="indefinite"/>
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </g>
    </svg>`;

  async function streamReplaceTextSmoothFast(targetEl, newText) {
    const p = targetEl.querySelector("p") || targetEl;
    p.innerText = "";
    let currentText = "";
    let chunkSize = 2;
    for (let i = 0; i < newText.length; i += chunkSize) {
      currentText += newText.slice(i, i + chunkSize);
      p.innerText = currentText;
      const selection = window.getSelection();
      const range = document.createRange();
      if (p.childNodes.length > 0) {
        range.setStart(p.childNodes[0], p.innerText.length);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        p.focus();
      }
      const delay = 10 + Math.random() * 20;
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  function createButton(id, ariaLabel, svgIcon, buttonText) {
    const buttonWrapper = document.createElement("div");
    buttonWrapper.id = id;
    buttonWrapper.style.display = "inline-block";
    buttonWrapper.innerHTML = `
        <button type="button" class="composer-btn" aria-label="${ariaLabel}" data-pill>
          ${svgIcon}
          <span style="margin-left: 8px;">${buttonText}</span>
        </button>`;
    return buttonWrapper;
  }

  function insertChatGPTButtons() {
    const footerActions = document.querySelector(
      '[data-testid="composer-footer-actions"]'
    );
    if (footerActions) {
      if (!document.getElementById(REFINE_BUTTON_ID)) {
        const refineBtn = createButton(
          REFINE_BUTTON_ID,
          "Quick Improve",
          REFINE_SVG_ICON,
          "Quick Improve"
        );
        const buttonElement = refineBtn.querySelector("button");
        if (buttonElement) {
          buttonElement.addEventListener("click", async () => {
            if (isRefining) return;
            const promptTextareaForCheck =
              document.getElementById("prompt-textarea");
            let promptText =
              promptTextareaForCheck?.querySelector("p")?.innerText.trim() ||
              "";
            if (!promptText) {
              console.log("Prompt textarea is empty.");
              return;
            }
            isRefining = true;
            const originalButtonContent = buttonElement.innerHTML;
            buttonElement.innerHTML = `${LOADER_SVG_ICON} <span style="margin-left: 8px;">Refining...</span>`;
            buttonElement.disabled = true;
            try {
              // Call backend to polish user input
              const response = await fetch(
                "https://gpt-utils-api.fly.dev/improve",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ user_input: promptText }),
                }
              );
              if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
              }
              const data = await response.json();
              const refinedText = data.reply || "";
              const promptTextarea = document.getElementById("prompt-textarea");
              if (promptTextarea) {
                await streamReplaceTextSmoothFast(promptTextarea, refinedText);
              }
            } catch (error) {
              console.error("Error during refinement:", error);
              const p =
                promptTextareaForCheck?.querySelector("p") ||
                promptTextareaForCheck;
              if (p) p.innerText = "Error refining. Please try again.";
            } finally {
              buttonElement.innerHTML = originalButtonContent;
              const newButtonTextSpan = buttonElement.querySelector("span");
              if (newButtonTextSpan)
                newButtonTextSpan.textContent = "Quick Improve";
              buttonElement.disabled = false;
              isRefining = false;
            }
          });
        }
        footerActions.appendChild(refineBtn);
      }
    }
  }

  function insertBanner() {
    const container = document.getElementById("thread-bottom-container");
    if (container && !document.getElementById("cgpt-utils-banner")) {
      container.insertAdjacentHTML(
        "beforebegin",
        `<div id="cgpt-utils-banner" class="text-token-text-secondary relative mt-auto flex min-h-8 w-full items-center justify-center p-2 text-center text-xs md:px-[60px]">
           <div>ChatGPT Utils 0.0.1 installed. <a href="#" class="underline" target="_blank">Rate Us</a></div>
         </div>`
      );
    }
  }

  function initChatGPT() {
    const observer = new MutationObserver((mutationsList, obs) => {
      const targetNode = document.querySelector(
        '[data-testid="composer-footer-actions"]'
      );
      if (targetNode) {
        if (!document.getElementById(REFINE_BUTTON_ID)) {
          insertChatGPTButtons();
        }
      }

      insertBanner();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    insertBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    initChatGPT();
  }
})();
