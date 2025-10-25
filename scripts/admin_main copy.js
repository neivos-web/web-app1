document.addEventListener("DOMContentLoaded", () => {
  const tooltip = document.getElementById("tooltip");

  function showTooltip(message = "Sauvegardé avec succès") {
    tooltip.textContent = message;
    tooltip.classList.add("show");
    setTimeout(() => tooltip.classList.remove("show"), 2000);
  }

  // Load saved data
  const savedData = JSON.parse(localStorage.getItem("editableData") || "{}");

  // Restore text content
  for (const [id, value] of Object.entries(savedData)) {
    if (id === "heroMedia") continue;
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  // Restore hero media (image or video)
  if (savedData.heroMedia) {
    const heroContainer = document.getElementById("hero-image");
    heroContainer.querySelectorAll("img, video").forEach(m => m.remove());

    const isVideo = savedData.heroMedia.startsWith("data:video");
    const media = document.createElement(isVideo ? "video" : "img");
    media.id = "hero-img";
    media.src = savedData.heroMedia;
    media.className = "w-full h-full object-cover opacity-80 transition-all duration-300";
    if (isVideo) {
      media.autoplay = true;
      media.loop = true;
      media.muted = true;
      media.playsInline = true;
    }

    heroContainer.insertBefore(media, heroContainer.querySelector(".edit-btn"));
  }

  // === Editable Text ===
  document.querySelectorAll("[data-editable]").forEach(el => {
    const btn = document.createElement("button");
    btn.classList.add("edit-btn", "text-blue-500", "ml-2");
    btn.innerHTML = "&#9998;";
    el.insertAdjacentElement("afterend", btn);
      if (el.tagName.toLowerCase() === "a") {
    el.addEventListener("click", e => e.preventDefault());
  }

    function activateEditing(element, button) {
      button.addEventListener("click", () => {
        const oldText = element.textContent.trim();
        const input = document.createElement("input");
        input.type = "text";
        input.value = oldText;
        input.classList.add("edit-input", "border-b", "border-blue-400", "bg-transparent", "text-current");
        input.style.width = Math.min(element.offsetWidth + 30, 600) + "px";

        element.replaceWith(input);
        input.focus();

        const save = () => {
          const newText = input.value.trim() || oldText;
          const newEl = document.createElement(element.tagName.toLowerCase());
          newEl.id = element.id;
          newEl.textContent = newText;
          newEl.className = element.className;
          newEl.setAttribute("data-editable", "");

          input.replaceWith(newEl);
          newEl.insertAdjacentElement("afterend", button);

          savedData[element.id] = newText;
          localStorage.setItem("editableData", JSON.stringify(savedData));
          showTooltip();

          activateEditing(newEl, button);
        };

        input.addEventListener("keydown", e => e.key === "Enter" && save());
        input.addEventListener("blur", save);
      });
    }

    activateEditing(el, btn);
  });

  // === Image/Video Upload ===
  const heroContainer = document.getElementById("hero-image");
  const heroEditBtn = heroContainer.querySelector(".edit-btn");

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*,video/*";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  heroEditBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result;
      heroContainer.querySelectorAll("img, video").forEach(m => m.remove());

      const isVideo = file.type.startsWith("video/");
      const media = document.createElement(isVideo ? "video" : "img");
      media.id = "hero-img";
      media.src = url;
      media.className = "w-full h-full object-cover opacity-80 transition-all duration-300";
      if (isVideo) {
        media.autoplay = true;
        media.loop = true;
        media.muted = true;
        media.playsInline = true;
      }

      heroContainer.insertBefore(media, heroEditBtn);

      savedData.heroMedia = url;
      localStorage.setItem("editableData", JSON.stringify(savedData));
      showTooltip("Média mis à jour !");
    };
    reader.readAsDataURL(file);
  });


   // Save button
        document.getElementById("save-btn").addEventListener("click", () => {
            const data = {};
            document.querySelectorAll("[data-editable]").forEach(el => {
                if(el.tagName.toLowerCase() === "img") {
                    data[el.id] = el.src;
                } else {
                    data[el.id] = el.textContent;
                }
            });
            localStorage.setItem("editableData", JSON.stringify(data));
            alert("Tout est sauvegardé !");
        });

        // Logout button
        document.getElementById("logout-btn").addEventListener("click", () => {
            alert("Déconnexion !");
            // Optionally: window.location.href = "login.html";
        });
});
