(function () {
  const REFINE_BUTTON_ID = "custom-refine-btn";
  const SUGGESTIONS_BUTTON_ID = "custom-suggestions-btn";

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
  const SELL_PROMPT_BUTTON_ID = "custom-sell-prompt-btn";

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
        background-color: rgba(255, 255, 255, 0.8); /* Whitish background */
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.15s ease-out; /* Faster animation */
      }
      #${MODAL_ID} {
        background-color: #fff; /* Modal box itself still white for contrast */
        padding: 25px;
        border-radius: 28px;
        border: 1px solid #D4D4D4; /* Lighter border color */
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); /* Softer shadow */
        width: 90vw;
        height: 90vh; /* Limit height to prevent overflow */
        max-width: 90vw;
        max-height: 90vh; /* Limit height to prevent overflow */
        display: flex; /* Use flexbox for layout */
        flex-direction: column; /* Stack children vertically */
        box-sizing: border-box; /* Ensure padding is included in width/height */
        position: relative;
        animation: scaleUpFadeIn 0.15s ease-out; /* Faster animation */
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
        color: #333; /* Darker hover color for close button */
      }
      #${MODAL_ID} h3 {
        margin-top: 0;
        margin-bottom: 15px;
        color: #333;
        text-align: left; /* Align title to the left */
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
      #${MODAL_ID} .sub-filters-section { /* New style for sub-filters */
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #f5f5f5; /* Lighter border for sub-filters */
      }
      #${MODAL_ID} .content-section {
        flex-grow: 1; /* Allow content to take remaining space */
        overflow-y: auto; /* Allow scrolling for content */
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
    // Optional: Remove event listeners from body/window if any were added for the modal
  }

  function openSuggestionsModal() {
    if (document.getElementById(MODAL_OVERLAY_ID)) {
      return; // Modal already open
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

    // Main Filters Section (for Categories)
    const filtersSection = document.createElement("div");
    filtersSection.className = "filters-section";

    // Content Section (will hold sub-filters and then final content)
    const contentSection = document.createElement("div");
    contentSection.className = "content-section";
    contentSection.innerHTML = "<p>Select a category to see options.</p>";

    promptCategories.forEach((category) => {
      const pill = document.createElement("div");
      pill.className = "filter-pill";
      pill.textContent = category.name;
      pill.dataset.category = category.name;

      pill.addEventListener("click", () => {
        // Deactivate other main category pills
        filtersSection
          .querySelectorAll(".filter-pill.active")
          .forEach((activePill) => {
            activePill.classList.remove("active");
          });
        // Activate current main category pill
        pill.classList.add("active");

        // Clear content section and prepare for sub-categories
        contentSection.innerHTML = "";

        const subFiltersSection = document.createElement("div");
        subFiltersSection.className = "sub-filters-section";

        const actualContentDisplay = document.createElement("div"); // For final content
        actualContentDisplay.innerHTML = `<p>Select a sub-category from '${category.name}'.</p>`;

        category.subCategories.forEach((subCategory) => {
          const subPill = document.createElement("div");
          subPill.className = "filter-pill";
          subPill.textContent = subCategory;
          subPill.dataset.subcategory = subCategory;

          subPill.addEventListener("click", () => {
            // Deactivate other sub-category pills
            subFiltersSection
              .querySelectorAll(".filter-pill.active")
              .forEach((activeSubPill) => {
                activeSubPill.classList.remove("active");
              });
            // Activate current sub-category pill
            subPill.classList.add("active");

            // Display placeholder for final content
            actualContentDisplay.innerHTML = `<p>Showing content for: ${category.name} &rarr; ${subCategory}</p>`;
            // Future: Here you would load the actual content/prompts for the selected subCategory
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

    overlay.addEventListener('click', function (event) {
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
    let chunkSize = 2; // Show 2 characters at a time

    for (let i = 0; i < newText.length; i += chunkSize) {
      currentText += newText.slice(i, i + chunkSize);
      p.innerText = currentText;

      // Move cursor to the end
      const selection = window.getSelection();
      const range = document.createRange();
      if (p.childNodes.length > 0) {
        // Ensure there's content to set cursor after
        range.setStart(p.childNodes[0], p.innerText.length);
        range.collapse(true); // Collapse the range to the start (which is now the end of text)
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // If p is empty (e.g., at the very start or if cleared), focus it
        p.focus();
      }

      // Faster base speed, still a bit random
      const delay = 10 + Math.random() * 20; // 10ms–30ms
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  function createButton(id, ariaLabel, svgIcon, buttonText) {
    const buttonWrapper = document.createElement("div");
    buttonWrapper.id = id;
    buttonWrapper.style.display = "inline-block"; // Suggestion for side-by-side, though parent flex is better
    buttonWrapper.innerHTML = `
        <button type="button" class="composer-btn" aria-label="${ariaLabel}" data-pill>
          ${svgIcon}
          <span style="margin-left: 8px;">${buttonText}</span>
        </button>`;
    return buttonWrapper;
  }

  function insertButton() {
    const footerActions = document.querySelector(
      '[data-testid="composer-footer-actions"]'
    );
    if (footerActions) {
      if (!document.getElementById(REFINE_BUTTON_ID)) {
        const refineBtn = createButton(
          REFINE_BUTTON_ID,
          "Quick Refine",
          REFINE_SVG_ICON,
          "Quick Refine"
        );
        if (refineBtn) {
          const buttonElement = refineBtn.querySelector("button");
          const buttonTextSpan = buttonElement.querySelector("span");

          if (buttonElement) {
            buttonElement.addEventListener("click", async () => {
              if (isRefining) {
                console.log("Refinement already in progress.");
                return;
              }

              const promptTextareaForCheck =
                document.getElementById("prompt-textarea");
              let promptText = "";
              if (promptTextareaForCheck) {
                const paragraphElementForCheck =
                  promptTextareaForCheck.querySelector("p");
                if (paragraphElementForCheck) {
                  promptText = paragraphElementForCheck.innerText.trim();
                }
              }

              if (promptText === "") {
                console.log(
                  "Prompt is empty. Adding example prompt to textarea."
                );
                const promptTextarea =
                  document.getElementById("prompt-textarea");
                if (promptTextarea) {
                  const paragraphElement = promptTextarea.querySelector("p");
                  if (paragraphElement) {
                    paragraphElement.innerText =
                      "Replace this and click Refine Prompt";
                  } else {
                    // Fallback if p tag is not found, though less ideal for contenteditable
                    promptTextarea.innerText =
                      "Replace this and click Refine Prompt";
                  }
                }
                return; // Stop further execution
              }

              isRefining = true;
              buttonElement.disabled = true;
              if (buttonTextSpan) buttonTextSpan.innerText = "Refining...";
              const originalIcon = buttonElement.querySelector("svg");
              if (originalIcon) {
                originalIcon.outerHTML = LOADER_SVG_ICON;
              }

              console.log("Refine button clicked. Fetching data...");

              try {
                // Fake API request
                await new Promise((resolve) =>
                  setTimeout(resolve, Math.random() * 1000 + 2000)
                ); // 2-3 seconds delay

                const response = await fetch(
                  "https://pokeapi.co/api/v2/pokemon/charmeleon"
                );
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const pokemonName = data.name;

                const promptTextarea =
                  document.getElementById("prompt-textarea");
                if (promptTextarea) {
                  const paragraphElement = promptTextarea.querySelector("p");
                  if (paragraphElement) {
                    await streamReplaceTextSmoothFast(
                      promptTextarea,
                      `Tell me about ${pokemonName}. `.repeat(10)
                    );
                    console.log(
                      "Prompt updated with Pokemon name:",
                      pokemonName
                    );
                  } else {
                    // Fallback if p tag is not found, though less ideal for contenteditable
                    promptTextarea.innerText = `Tell me about ${pokemonName}.`;
                    console.log(
                      "Prompt <p> tag not found, updated div innerText directly."
                    );
                  }
                } else {
                  console.log(
                    "prompt-textarea not found when trying to update."
                  );
                }
              } catch (error) {
                console.error("Error during refinement:", error);
                const promptTextarea =
                  document.getElementById("prompt-textarea");
                if (promptTextarea) {
                  const paragraphElement = promptTextarea.querySelector("p");
                  if (paragraphElement) {
                    paragraphElement.innerText =
                      "Error fetching data. Please try again.";
                  } else {
                    promptTextarea.innerText =
                      "Error fetching data. Please try again.";
                  }
                }
              } finally {
                // Restore button
                if (originalIcon) {
                  // originalIcon might have been removed if createButton was called again
                  const currentSvg = buttonElement.querySelector("svg");
                  if (
                    currentSvg &&
                    currentSvg.classList.contains("lucide-loader-circle")
                  ) {
                    currentSvg.outerHTML = REFINE_SVG_ICON;
                  }
                }
                buttonElement.disabled = false;
                isRefining = false;
                if (buttonTextSpan) buttonTextSpan.innerText = "Quick Refine"; // Restore text
                console.log("Refinement process finished.");
              }
            });
          }
          footerActions.appendChild(refineBtn);
          console.log("✅ Refine button added.");
        }
      }

      // Suggestions Button
      if (!document.getElementById(SUGGESTIONS_BUTTON_ID)) {
        const suggestionsBtnWrapper = createButton(
          SUGGESTIONS_BUTTON_ID,
          "Prompt Library",
          SUGGESTIONS_SVG_ICON,
          "Prompt Library"
        );
        if (suggestionsBtnWrapper) {
          const suggestionsButtonElement =
            suggestionsBtnWrapper.querySelector("button");
          if (suggestionsButtonElement) {
            suggestionsButtonElement.addEventListener(
              "click",
              openSuggestionsModal
            );
          }
          footerActions.appendChild(suggestionsBtnWrapper);
          console.log("✅ Prompt Library button added.");
        }
      }

      // Sell a Prompt Button
      if (!document.getElementById(SELL_PROMPT_BUTTON_ID)) {
        const sellPromptBtnWrapper = createButton(
          SELL_PROMPT_BUTTON_ID,
          "Sell a Prompt",
          SELL_PROMPT_SVG_ICON,
          "Sell a Prompt"
        );
        if (sellPromptBtnWrapper) {
          const sellPromptButtonElement = sellPromptBtnWrapper.querySelector("button");
          if (sellPromptButtonElement) {
            sellPromptButtonElement.addEventListener("click", () => {
              window.open('https://placeholder-sell-prompt-link.com', '_blank'); // Replace with actual link
            });
          }
          footerActions.appendChild(sellPromptBtnWrapper);
          console.log("✅ Sell a Prompt button added.");
        }
      }
    }
  }

  // Observe changes to the DOM
  const observer = new MutationObserver(() => {
    insertButton();
  });

  // Start observing the body (or documentElement)
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Initial try in case the element is already present
  insertButton();
})();
