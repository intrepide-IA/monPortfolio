// form-handler.js - Gestion du formulaire de contact

function initFormHandler() {
    const form = document.getElementById("contact-form");
    const loader = document.getElementById("loader");
    const statusMessage = document.getElementById("status-message");

    if (!form) {
        console.warn('Contact form not found');
        return;
    }

    // Gestion de la soumission du formulaire
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Afficher le loader
        if (loader) {
            loader.classList.remove("hidden");
        }
        
        // Cacher le message précédent
        if (statusMessage) {
            statusMessage.classList.add("hidden");
        }

        // Envoi via EmailJS
        emailjs.sendForm("service_43lqfnp", "template_ix8hpo4", form)
            .then(() => {
                // Succès
                if (loader) {
                    loader.classList.add("hidden");
                }
                
                if (statusMessage) {
                    const lang = translationManager ? translationManager.getCurrentLanguage() : 'fr';
                    const successMessage = lang === 'fr' 
                        ? "✅ Message envoyé avec succès !" 
                        : "✅ Message sent successfully!";
                    
                    statusMessage.textContent = successMessage;
                    statusMessage.className = "block text-green-400 text-center mt-4 font-medium";
                    statusMessage.classList.remove("hidden");
                }
                
                // Réinitialiser le formulaire
                form.reset();
                
                // Cacher le message après 5 secondes
                setTimeout(() => {
                    if (statusMessage) {
                        statusMessage.classList.add("hidden");
                    }
                }, 5000);
                
            }, (err) => {
                // Erreur
                console.error('EmailJS Error:', err);
                
                if (loader) {
                    loader.classList.add("hidden");
                }
                
                if (statusMessage) {
                    const lang = translationManager ? translationManager.getCurrentLanguage() : 'fr';
                    const errorMessage = lang === 'fr' 
                        ? "❌ Une erreur est survenue, veuillez réessayer." 
                        : "❌ An error occurred, please try again.";
                    
                    statusMessage.textContent = errorMessage;
                    statusMessage.className = "block text-red-400 text-center mt-4 font-medium";
                    statusMessage.classList.remove("hidden");
                }
                
                // Cacher le message après 5 secondes
                setTimeout(() => {
                    if (statusMessage) {
                        statusMessage.classList.add("hidden");
                    }
                }, 5000);
            });
    });

    // Validation en temps réel (optionnel)
    const emailInput = document.getElementById("email");
    if (emailInput) {
        emailInput.addEventListener("blur", function() {
            const emailValue = this.value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (emailValue && !emailRegex.test(emailValue)) {
                this.classList.add("border-red-500");
                this.classList.remove("border-gray-700");
            } else {
                this.classList.remove("border-red-500");
                this.classList.add("border-gray-700");
            }
        });
    }

    // Validation du nom (au moins 2 caractères)
    const nameInput = document.getElementById("name");
    if (nameInput) {
        nameInput.addEventListener("blur", function() {
            if (this.value.trim().length < 2 && this.value.length > 0) {
                this.classList.add("border-red-500");
                this.classList.remove("border-gray-700");
            } else {
                this.classList.remove("border-red-500");
                this.classList.add("border-gray-700");
            }
        });
    }

    // Validation du message (au moins 10 caractères)
    const messageInput = document.getElementById("message");
    if (messageInput) {
        messageInput.addEventListener("blur", function() {
            if (this.value.trim().length < 10 && this.value.length > 0) {
                this.classList.add("border-red-500");
                this.classList.remove("border-gray-700");
            } else {
                this.classList.remove("border-red-500");
                this.classList.add("border-gray-700");
            }
        });
    }

    console.log('✅ Form handler initialized');
}

// Export pour utilisation globale
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initFormHandler };
}