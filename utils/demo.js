const p = "lte abc abc def juk myabc lte";

const reg = /\b(abc|lte)\b/g;
console.log(p.replace(reg, (a) => `$${a}`));
