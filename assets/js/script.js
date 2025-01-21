// Inicializar Select2 no seletor principal
document.addEventListener('DOMContentLoaded', () => {
    const itemSelect = document.getElementById('itemSelect');
    Select2(itemSelect, {
        placeholder: 'Select an item',
        allowClear: true,
    });
});
