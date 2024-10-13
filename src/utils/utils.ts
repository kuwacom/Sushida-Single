
export const sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

export const getAssetUrl = (path: string) => {
  return new URL(path, import.meta.url).href;
};

export const getBlobId = (url: string) => {
  // URLオブジェクトを作成し、pathnameからID部分を取得
  const parsedUrl = new URL(url);
  const blobId = parsedUrl.pathname.split('/').pop();
  return blobId || '';
};

export const base64ToBlob = (base64: string, mimeType: string) => {
  // Base64文字列をデコード
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // デコードしたバイナリデータをBlobとして返す
  return new Blob([bytes], { type: mimeType });
}


export const getTouchDistance = (event: React.TouchEvent) => {
  const dx = event.touches[0].clientX - event.touches[1].clientX;
  const dy = event.touches[0].clientY - event.touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}
export const getTouchCenter = (event: React.TouchEvent) => {
  let centerX, centerY;
  if (event.touches[0].clientX < event.touches[1].clientX) {
      centerX = event.touches[1].clientX - event.touches[0].clientX;
      centerX = event.touches[0].clientX + centerX / 2;
  } else {
      centerX = event.touches[0].clientX - event.touches[1].clientX;
      centerX = event.touches[1].clientX + centerX / 2;
  }
  if (event.touches[0].clientY < event.touches[1].clientY) {
      centerY = event.touches[1].clientY - event.touches[0].clientY;
      centerY = event.touches[0].clientY + centerY / 2;
  } else {
      centerY = event.touches[0].clientY - event.touches[1].clientY;
      centerY = event.touches[1].clientY + centerY / 2;
  }
  return {
      centerX,
      centerY
  };
}

export const roundUp = (num: number, max: number) => {
  return Math.ceil(num * 10**max) / 10**max;
}