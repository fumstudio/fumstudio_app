const searchInput = document.getElementById('searchInput');
const sections = document.querySelectorAll('main > section');
const listItems = document.querySelectorAll('#list li');

searchInput.addEventListener('input', function() {
  const searchTerm = this.value.toLowerCase();

  sections.forEach(section => {
    const sectionId = section.id;
    const sectionContent = section.textContent.toLowerCase();

    if (sectionContent.includes(searchTerm)) {
      section.style.display = 'block';
      window.scrollTo({ top: section.offsetTop, behavior: 'smooth' });
    } else {
      section.style.display = 'none';
    }
  });

  listItems.forEach(item => {
    const text = item.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
});