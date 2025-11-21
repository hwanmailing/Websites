function showTable(tableName) {
    // Hide all containers
    document.querySelectorAll('[id$="Container"]').forEach(container => {
        container.style.display = 'none';
    });
    
    // Show selected container
    const container = document.getElementById(`${tableName}Container`);
    if (container) {
        container.style.display = 'block';
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Show first table by default
document.addEventListener('DOMContentLoaded', () => {
    const firstTable = document.querySelector('.nav-link');
    if (firstTable) {
        firstTable.click();
    }
});