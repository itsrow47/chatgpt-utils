(function () {
  const REFINE_BUTTON_ID = "custom-refine-btn";
  const SUGGESTIONS_BUTTON_ID = "custom-suggestions-btn";
  const SELL_PROMPT_BUTTON_ID = "custom-sell-prompt-btn";

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

  const SUGGESTIONS_SVG_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-library-icon lucide-library"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>`;

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

  const SELL_PROMPT_SVG_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dollar-sign-icon lucide-dollar-sign"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;

  const MODAL_STYLES_ID = "promptcraft-modal-styles";
  const MODAL_OVERLAY_ID = "promptcraft-suggestions-overlay";
  const MODAL_ID = "promptcraft-suggestions-modal";
  const MODAL_CLOSE_BTN_ID = "promptcraft-suggestions-close-btn";

  function injectModalStyles() {
    if (document.getElementById(MODAL_STYLES_ID)) {
      return;
    }
    const styleSheet = document.createElement("style");
    styleSheet.id = MODAL_STYLES_ID;
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleUpFadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      #${MODAL_OVERLAY_ID} {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.15s ease-out;
      }
      #${MODAL_ID} {
        background-color: #fff;
        padding: 25px;
        border-radius: 28px;
        border: 1px solid #D4D4D4;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        width: 90vw;
        height: 90vh;
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        position: relative;
        animation: scaleUpFadeIn 0.15s ease-out;
        color: #333;
      }
      #${MODAL_CLOSE_BTN_ID} {
        position: absolute;
        top: 10px;
        right: 20px;
        background: transparent;
        border: none;
        font-size: 1.8em;
        color: #888;
        cursor: pointer;
        line-height: 1;
      }
      #${MODAL_CLOSE_BTN_ID}:hover {
        color: #333;
      }
      #${MODAL_ID} h3 {
        margin-top: 0;
        margin-bottom: 15px;
        color: #333;
        text-align: left;
      }
      #${MODAL_ID} .filters-section {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
      }
      #${MODAL_ID} .filter-pill {
        padding: 8px 15px;
        border: 1px solid #ccc;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        font-size: 0.9em;
      }
      #${MODAL_ID} .filter-pill:hover {
        background-color: #f0f0f0;
      }
      #${MODAL_ID} .filter-pill.active {
        border-color: #007bff;
        color: #007bff;
        background-color: #e6f2ff;
      }
      #${MODAL_ID} .sub-filters-section {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #f5f5f5;
      }
      #${MODAL_ID} .content-section {
        flex-grow: 1;
        overflow-y: auto;
      }
      #${MODAL_ID} .content-section p {
        margin-bottom: 10px;
        line-height: 1.6;
      }
    `;
    document.head.appendChild(styleSheet);
  }

  function closeSuggestionsModal() {
    const overlay = document.getElementById(MODAL_OVERLAY_ID);
    if (overlay) {
      overlay.remove();
    }
  }

  function openSuggestionsModal() {
    if (document.getElementById(MODAL_OVERLAY_ID)) {
      return;
    }

    injectModalStyles();

    const promptCategories = [
      {
        name: "Trending & Popular",
        subCategories: [
          "Latest Trends",
          "Popular Topics",
          "Viral Content",
          "Current Events",
          "Hot Discussions",
        ],
      },
      {
        name: "Marketing & SEO",
        subCategories: [
          "SEO Content",
          "Ad Copy",
          "Social Media",
          "Email Marketing",
          "Branding",
        ],
      },
      {
        name: "Writing & Content",
        subCategories: [
          "Blog Writing",
          "Storytelling",
          "Email Drafting",
          "Social Posts",
          "Scriptwriting",
        ],
      },
      {
        name: "Coding & Tech",
        subCategories: [
          "Generate Code",
          "Explain Code",
          "Debugging",
          "Regex & Scripting",
          "API & Docs",
        ],
      },
      {
        name: "Business & Sales",
        subCategories: [
          "Startup Tools",
          "Customer Personas",
          "Sales Emails",
          "Investor Pitches",
          "Market Research",
        ],
      },
      {
        name: "Learning & Education",
        subCategories: [
          "Study Aids",
          "Quiz Creation",
          "Summarization",
          "Tutoring Prompts",
          "Flashcards",
        ],
      },
    ];

    const overlay = document.createElement("div");
    overlay.id = MODAL_OVERLAY_ID;

    const modal = document.createElement("div");
    modal.id = MODAL_ID;

    const closeButton = document.createElement("button");
    closeButton.id = MODAL_CLOSE_BTN_ID;
    closeButton.innerHTML = "&times;";
    closeButton.setAttribute("aria-label", "Close suggestions modal");
    closeButton.onclick = closeSuggestionsModal;

    const modalTitle = document.createElement("h3");
    modalTitle.innerText = "Prompt Library";

    const filtersSection = document.createElement("div");
    filtersSection.className = "filters-section";

    const contentSection = document.createElement("div");
    contentSection.className = "content-section";
    contentSection.innerHTML = "<p>Select a category to see options.</p>";

    promptCategories.forEach((category) => {
      const pill = document.createElement("div");
      pill.className = "filter-pill";
      pill.textContent = category.name;
      pill.dataset.category = category.name;

      pill.addEventListener("click", () => {
        filtersSection
          .querySelectorAll(".filter-pill.active")
          .forEach((activePill) => activePill.classList.remove("active"));
        pill.classList.add("active");
        contentSection.innerHTML = "";

        const subFiltersSection = document.createElement("div");
        subFiltersSection.className = "sub-filters-section";

        const actualContentDisplay = document.createElement("div");
        actualContentDisplay.innerHTML = `<p>Select a sub-category from '${category.name}'.</p>`;

        category.subCategories.forEach((subCategory) => {
          const subPill = document.createElement("div");
          subPill.className = "filter-pill";
          subPill.textContent = subCategory;
          subPill.dataset.subcategory = subCategory;

          subPill.addEventListener("click", () => {
            subFiltersSection
              .querySelectorAll(".filter-pill.active")
              .forEach((activeSubPill) =>
                activeSubPill.classList.remove("active")
              );
            subPill.classList.add("active");
            actualContentDisplay.innerHTML = `<p>Showing content for: ${category.name} &rarr; ${subCategory}</p>`;
          });
          subFiltersSection.appendChild(subPill);
        });
        contentSection.appendChild(subFiltersSection);
        contentSection.appendChild(actualContentDisplay);
      });
      filtersSection.appendChild(pill);
    });

    modal.appendChild(closeButton);
    modal.appendChild(modalTitle);
    modal.appendChild(filtersSection);
    modal.appendChild(contentSection);
    overlay.appendChild(modal);

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        closeSuggestionsModal();
      }
    });
    document.body.appendChild(overlay);
  }

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

  function createClaudeButton(buttonHtmlId, ariaLabel, svgIcon) {
    const wrapperDiv = document.createElement("div");
    wrapperDiv.className = "flex items-center prompt-craft-button--claude";

    wrapperDiv.innerHTML = `
        <div class="flex shrink-0" data-state="closed" style="opacity: 1; transform: none;">
            <button class="inline-flex items-center justify-center relative shrink-0 can-focus select-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:drop-shadow-none border-0.5 transition-all h-8 min-w-8 rounded-lg flex items-center px-[7.5px] group !pointer-events-auto !outline-offset-1 text-text-300 border-border-300 active:scale-[0.98] hover:text-text-200/90 hover:bg-bg-100" 
                    type="button" 
                    id="${buttonHtmlId}" 
                    aria-label="${ariaLabel}"
                    title="${ariaLabel}"
                    data-testid="${buttonHtmlId}-testid">
                <div class="flex flex-row items-center justify-center gap-1">
                    ${svgIcon}
                </div>
            </button>
        </div>
    `;
    return wrapperDiv;
  }

  // --- CHATGPT.COM SPECIFIC LOGIC ---
  function insertChatGPTButtons() {
    const footerActions = document.querySelector(
      '[data-testid="composer-footer-actions"]'
    );
    if (footerActions) {
      // Quick Refine Button
      if (!document.getElementById(REFINE_BUTTON_ID)) {
        const refineBtn = createButton(
          REFINE_BUTTON_ID,
          "Quick Refine",
          REFINE_SVG_ICON,
          "Quick Refine"
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
              await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
              const refinedText = "This is a refined version of: " + promptText;
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
                newButtonTextSpan.textContent = "Quick Refine";
              buttonElement.disabled = false;
              isRefining = false;
            }
          });
        }
        footerActions.appendChild(refineBtn);
      }

      // Prompt Library Button
      if (!document.getElementById(SUGGESTIONS_BUTTON_ID)) {
        const suggestionsBtn = createButton(
          SUGGESTIONS_BUTTON_ID,
          "Prompt Library",
          SUGGESTIONS_SVG_ICON,
          "Prompt Library"
        );
        suggestionsBtn
          .querySelector("button")
          ?.addEventListener("click", () => {
            openSuggestionsModal();
          });
        footerActions.appendChild(suggestionsBtn);
      }

      // Sell a Prompt Button
      if (!document.getElementById(SELL_PROMPT_BUTTON_ID)) {
        const sellPromptBtn = createButton(
          SELL_PROMPT_BUTTON_ID,
          "Sell a Prompt",
          SELL_PROMPT_SVG_ICON,
          "Sell a Prompt"
        );
        sellPromptBtn.querySelector("button")?.addEventListener("click", () => {
          window.open("https://placeholder-sell-prompt-link.com", "_blank");
        });
        footerActions.appendChild(sellPromptBtn);
      }
    }
  }

  function initChatGPT() {
    const observer = new MutationObserver((mutationsList, obs) => {
      const targetNode = document.querySelector(
        '[data-testid="composer-footer-actions"]'
      );
      if (targetNode) {
        // Check if buttons are already there to prevent duplicates
        if (
          !document.getElementById(REFINE_BUTTON_ID) ||
          !document.getElementById(SUGGESTIONS_BUTTON_ID) ||
          !document.getElementById(SELL_PROMPT_BUTTON_ID)
        ) {
          insertChatGPTButtons();
        }
        // Keep observing as ChatGPT might re-render the footer
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // --- CLAUDE.AI SPECIFIC LOGIC ---
  function insertClaudeAIButtons(targetContainer) {
    console.log(
      "Attempting to insert Claude.ai buttons (new structure) into:",
      targetContainer
    );

    if (!targetContainer) {
      console.error(
        "Target container for Claude.ai buttons is null or undefined."
      );
      return;
    }

    // Check if buttons (wrappers) are already there using the specific class
    if (targetContainer.querySelector(".prompt-craft-button--claude")) {
      console.log(
        "Prompt Craft buttons (Claude structure) already exist in this container."
      );
      return;
    }

    // Define unique IDs for Claude button elements
    const CLAUDE_REFINE_BTN_ID = "prompt-craft-claude-refine-btn";
    const CLAUDE_LIBRARY_BTN_ID = "prompt-craft-claude-library-btn";
    const CLAUDE_SELL_BTN_ID = "prompt-craft-claude-sell-btn";

    // Create "Quick Refine" button for Claude.ai
    const refineButtonWrapperClaude = createClaudeButton(
      CLAUDE_REFINE_BTN_ID,
      "Quick Refine",
      REFINE_SVG_ICON
    );
    const actualRefineButtonClaude =
      refineButtonWrapperClaude.querySelector("button");
    if (actualRefineButtonClaude) {
      actualRefineButtonClaude.addEventListener("click", async () => {
        if (isRefining) return;

        const promptEditableDiv = document.querySelector(
          'div[contenteditable="true"].ProseMirror'
        );
        const promptPTag = promptEditableDiv
          ? promptEditableDiv.querySelector("p")
          : null;
        let promptText = promptPTag ? promptPTag.textContent.trim() : "";

        if (!promptText) {
          console.log("Claude prompt textarea or p tag is empty or not found.");
          return;
        }

        isRefining = true;
        const buttonIconContainer =
          actualRefineButtonClaude.querySelector("div.flex-row");
        const originalIconHTML = buttonIconContainer
          ? buttonIconContainer.innerHTML
          : REFINE_SVG_ICON;
        if (buttonIconContainer) {
          buttonIconContainer.innerHTML = LOADER_SVG_ICON;
        }
        actualRefineButtonClaude.disabled = true;

        try {
          console.log("Claude Quick Refine clicked. Prompt:", promptText);
          // Simulate API call or processing
          await new Promise((resolve) => setTimeout(resolve, 1500));

          const refinedText =
            "This is a refined Claude version of: " + promptText; // Simulated refined text

          if (promptPTag) {
            await streamReplaceTextSmoothFast(promptPTag, refinedText);
          } else {
            // Fallback if p tag somehow became null, though unlikely if promptText was found
            console.error("Claude prompt P tag not found for streaming.");
          }

          console.log("Simulated refining and streaming complete for Claude.");
        } catch (error) {
          console.error("Error during Claude refinement:", error);
        } finally {
          if (buttonIconContainer) {
            buttonIconContainer.innerHTML = originalIconHTML;
          }
          actualRefineButtonClaude.disabled = false;
          isRefining = false;
        }
      });
    }

    // Create "Prompt Library" button for Claude.ai
    const suggestionsButtonWrapperClaude = createClaudeButton(
      CLAUDE_LIBRARY_BTN_ID,
      "Prompt Library",
      SUGGESTIONS_SVG_ICON
    );
    const actualSuggestionsButtonClaude =
      suggestionsButtonWrapperClaude.querySelector("button");
    if (actualSuggestionsButtonClaude) {
      actualSuggestionsButtonClaude.addEventListener(
        "click",
        openSuggestionsModal
      );
    }

    // Create "Sell a Prompt" button for Claude.ai
    const sellPromptButtonWrapperClaude = createClaudeButton(
      CLAUDE_SELL_BTN_ID,
      "Sell a Prompt",
      SELL_PROMPT_SVG_ICON
    );
    const actualSellPromptButtonClaude =
      sellPromptButtonWrapperClaude.querySelector("button");
    if (actualSellPromptButtonClaude) {
      actualSellPromptButtonClaude.addEventListener("click", () => {
        window.open("https://promptbase.com/create", "_blank");
      });
    }

    // Prepend new button wrappers to the target container so they appear at the start.
    // Prepending in this order (Sell, then Library, then Refine)
    // results in the visual order: [Refine, Library, Sell, ...existing children]
    targetContainer.prepend(sellPromptButtonWrapperClaude);
    targetContainer.prepend(suggestionsButtonWrapperClaude);
    targetContainer.prepend(refineButtonWrapperClaude);

    console.log(
      "Successfully inserted Claude.ai buttons (new structure) at the beginning."
    );
  }

  function initClaudeAI() {
    console.log("Hello from Prompt Craft on Claude.ai!");
    const observer = new MutationObserver((mutationsList, obs) => {
      // Check if buttons are already on the page to prevent re-running logic if already injected.
      // This check is more general, specific check is done before insertion.
      if (document.querySelector(".prompt-craft-button--claude")) {
        // console.log("Claude buttons detected on page, disconnecting observer.");
        obs.disconnect();
        return;
      }

      const radixElement = document.querySelector('[id^="radix-"]');
      let targetNode = null;

      if (
        radixElement &&
        radixElement.previousElementSibling &&
        radixElement.previousElementSibling.matches(
          "div.relative.flex-1.flex.items-center.gap-2.shrink.min-w-0" // This selector seems specific, ensure it's correct for Claude.ai
        )
      ) {
        targetNode = radixElement.previousElementSibling;
      } else if (
        radixElement &&
        radixElement.previousElementSibling &&
        radixElement.previousElementSibling.tagName === "DIV"
      ) {
        // Fallback if the specific class match fails but a div previous sibling exists
        // This is based on the user's description: "a flex div which is the previous sibling"
        console.log(
          "Specific selector for previous sibling of radix element did not match, but found a DIV. Using it as target."
        );
        targetNode = radixElement.previousElementSibling;
      } else {
        // Fallback: search for the div more broadly if the radix-based approach fails
        const potentialTargets = document.querySelectorAll(
          "div.relative.flex-1.flex.items-center.gap-2.shrink.min-w-0" // Corrected selector (was :flex)
        );
        for (let pt of potentialTargets) {
          if (
            pt.nextElementSibling &&
            pt.nextElementSibling.id &&
            pt.nextElementSibling.id.startsWith("radix-")
          ) {
            targetNode = pt;
            break;
          }
        }
      }

      if (targetNode) {
        console.log("Found target node for Claude.ai buttons:", targetNode);
        let buttonsInjectedThisCall = false;
        // Check again specifically in the targetNode before inserting
        if (!targetNode.querySelector(".prompt-craft-button--claude")) {
          insertClaudeAIButtons(targetNode); // Pass the found node
          buttonsInjectedThisCall = true;
          console.log(
            "Prompt Craft buttons inserted for Claude.ai by this observer call."
          );
        } else {
          console.log(
            "Prompt Craft buttons already present in the identified targetNode for Claude.ai."
          );
        }

        // Disconnect the observer since we've found the target and attempted/confirmed button state.
        console.log(
          "Disconnecting Claude.ai observer as target processing is complete."
        );
        obs.disconnect();
      } else {
        // console.log("Target node for Claude.ai not found yet, continuing to observe...");
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // --- MAIN INITIALIZATION LOGIC ---
  function init() {
    const hostname = window.location.hostname;
    if (hostname.includes("chatgpt.com")) {
      initChatGPT();
    } else if (hostname.includes("claude.ai")) {
      initClaudeAI();
    }
  }

  // --- SCRIPT EXECUTION ---
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
