afterEach(() => {
  document.head
    .querySelectorAll('link[rel="canonical"], meta[name="description"], meta[name="robots"]')
    .forEach((tag) => tag.remove());
});
