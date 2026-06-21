// Bridge between Segmented Button UI components and the hidden native select element
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.segmented-button');
    const select = document.getElementById('format-select');
    
    if (!select) return;

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active states
            buttons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
                const checkmark = b.querySelector('.checkmark');
                if (checkmark) {
                    checkmark.classList.add('hidden');
                }
            });

            // Set active state on clicked button
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
            const checkmark = button.querySelector('.checkmark');
            if (checkmark) {
                checkmark.classList.remove('hidden');
            }

            // Update hidden native select value
            const val = button.getAttribute('data-value');
            select.value = val;

            // Trigger change event to keep form state aligned
            select.dispatchEvent(new Event('change', { bubbles: true }));
        });
    });
});
