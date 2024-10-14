const btn = document.querySelector('.btn-menu');
const nav = document.querySelector('.main-nav');

btn.addEventListener('click', () => {
  nav.classList.toggle('open-menu'); //  クリックするたびに open-menuクラスが付いたり外れたりする
  if (btn.innerHTML === '+') {
    btn.innerHTML = '-';
  } else {
    btn.innerHTML = '+';
  }
});

function showPage(pageId) {
  // すべてのページを非表示にする
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));

  // クリックされたページを表示する
  (document.getElementById(pageId)).classList.add('active');
  console.log(pages);
}
