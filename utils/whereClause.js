class WhereClause {
  constructor(result, bigQ) {
    this.result = result;
    this.bigQ = bigQ;
  }

  search() {
    const searchword = this.bigQ.search
      ? {
          name: {
            $regex: this.bigQ.search,
            $options: "i",
          },
        }
      : {};

    this.result = this.result.find({ ...searchword });
    return this;
  }

  filter() {
    const copyQ = { ...this.bigQ };
    delete copyQ["search"];
    delete copyQ["page"];
    delete copyQ["limit"];

    let strOfCopyQ = JSON.stringify(copyQ);
    strOfCopyQ = strOfCopyQ?.replace(/\b(gte|lte|gt|lt)\b/g, (p) => `$${p}`);
    const jsonOfCopyQ = JSON.parse(strOfCopyQ);

    this.result = this.result.find(jsonOfCopyQ);
    return this;
  }

  pager(resultPerPage) {
    let currentPage = this.bigQ.page || 1;

    this.result = this.result
      .skip(resultPerPage * (currentPage - 1))
      .limit(resultPerPage);
    return this;
  }
}

module.exports = WhereClause;
