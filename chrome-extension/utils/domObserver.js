export function observeDOM(callback) {
  const observer = new MutationObserver(() => {
    callback();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
