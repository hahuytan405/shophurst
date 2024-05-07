const sortButton = document.querySelector('.sort-button');
const sortInput = document.querySelector('input[name=typeSort]');
const priceMin = document.querySelector('input[name=priceMin]');
const priceMax = document.querySelector('input[name=priceMax]');

const typeR = document.querySelector('input[name=typeR]');
const priceMinR = document.querySelector('input[name=priceMinR]');
const priceMaxR = document.querySelector('input[name=priceMaxR]');
const sortByR = document.querySelector('input[name=sortByR]');
const typeSortR = document.querySelector('input[name=typeSortR]');
const colorR = document.querySelector('input[name=colorR]');

document.querySelector('.sort-button').addEventListener('click', changeSort);
function changeSort() {
  if (
    sortButton.getAttribute('class') === 'sort-button zmdi zmdi-sort-amount-asc'
  ) {
    sortButton.classList.remove('zmdi-sort-amount-asc');
    sortButton.classList.add('zmdi-sort-amount-desc');
    sortInput.value = 'desc';
  } else {
    sortButton.classList.add('zmdi-sort-amount-asc');
    sortButton.classList.remove('zmdi-sort-amount-desc');
    sortInput.value = 'asc';
  }
}

document.querySelector(`option[value="${sortByR.value}"]`).selected = true;

if (typeSortR.value == 'desc') {
  sortButton.classList.remove('zmdi-sort-amount-asc');
  sortButton.classList.add('zmdi-sort-amount-desc');
  sortInput.value = 'desc';
}

priceMin.value = document.querySelector('input[name=priceMinR]').value;
priceMax.value = document.querySelector('input[name=priceMaxR]').value;

if (typeR.value) {
  const element = document.querySelector(
    `a.categories[href="/shop/?type=${typeR.value}"]`
  );
  element.classList.add('active');
}
console.log(colorR.value);

listColorR = colorR.value.split(',');
for (const colorItem of listColorR) {
  checkBoxColor = document.querySelector(`input[value=${colorItem}]`);
  checkBoxColor.checked = true;
}
