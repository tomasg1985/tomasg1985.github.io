document.querySelectorAll('[data-auth-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const feedback = form.querySelector('[data-auth-feedback]');

        if (feedback) {
            feedback.textContent = 'El servicio de cuentas todavía no está conectado. No se envió ningún dato.';
        }
    });
});
