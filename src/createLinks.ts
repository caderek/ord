function createDownloadLink(url: string, name: string, ext: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}.${ext}`;
  link.target = "_blank";
  link.innerText = "download";
  return link;
}

function createStandaloneLink(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.innerText = "open";
  return link;
}

export { createDownloadLink, createStandaloneLink };
