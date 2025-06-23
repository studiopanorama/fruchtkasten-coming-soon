// Minimaler Polyfill für pathSegList, nur wenn nicht vorhanden

if (
  typeof SVGPathElement !== 'undefined' &&
  !('pathSegList' in SVGPathElement.prototype)
) {
  Object.defineProperty(SVGPathElement.prototype, 'pathSegList', {
    get: function () {
      const length = this.getTotalLength();
      const samples = Math.ceil(length / 4);
      const list = [];

      for (let i = 0; i <= samples; i++) {
        const pt = this.getPointAtLength((i / samples) * length);
        list.push({ x: pt.x, y: pt.y });
      }

      return {
        numberOfItems: list.length,
        getItem: function (i) {
          return list[i];
        }
      };
    }
  });
}