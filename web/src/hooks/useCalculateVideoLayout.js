import { useEffect } from 'react';

// https://adosov.dev/zoom-video-gallery-p1/
function calculateLayout(containerWidth, containerHeight, videoCount, aspectRatio) {
  let bestLayout = {
    area: 0,
    cols: 0,
    rows: 0,
    width: 0,
    height: 0,
  };

  // brute-force search layout where video occupy the largest area of the container
  for (let cols = 1; cols <= videoCount; cols++) {
    const rows = Math.ceil(videoCount / cols);
    const hScale = containerWidth / (cols * aspectRatio);
    const vScale = containerHeight / rows;
    let width;
    let height;
    if (hScale <= vScale) {
      width = Math.floor(containerWidth / cols);
      height = Math.floor(width / aspectRatio);
    } else {
      height = Math.floor(containerHeight / rows);
      width = Math.floor(height * aspectRatio);
    }
    const area = width * height;
    if (area > bestLayout.area) {
      bestLayout = {
        area,
        width,
        height,
        rows,
        cols,
      };
    }
  }
  return bestLayout;
}

export const useCalculateVideoLayout = (gallery, videoCount) => {
  useEffect(() => {
    const recalculateLayout = () => {
      const headerHeight = document.getElementsByTagName('header')?.[0]?.offsetHeight;
      const aspectRatio = 16 / 9;

      const screenWidth = document.body.getBoundingClientRect().width;
      const screenHeight = document.body.getBoundingClientRect().height - headerHeight;

      const { width, height, cols } = calculateLayout(screenWidth, screenHeight, videoCount, aspectRatio);

      gallery.current?.style?.setProperty('--width', width + 'px');
      gallery.current?.style?.setProperty('--height', height + 'px');
      gallery.current?.style?.setProperty('--cols', cols + '');
    };

    recalculateLayout();

    window.addEventListener('resize', recalculateLayout);

    return () => {
      window.removeEventListener('resize', recalculateLayout);
    };
  }, [gallery.current, videoCount]);
};
