const dateHelper = {
  
  /**
   * Converts the input date into a compact or standard date format.
   *
   * @param {string | number | Date} inputDate - The input date to be converted.
   * @param {boolean} [compactFormat=true] - Indicates whether to return the compact date format. Default is true.
   * @return {string} The converted date in the specified format.
   */
  convertDate: (inputDate, compactFormat = true) => {
    let parsedDate = new Date(inputDate);
    if (isNaN(parsedDate.getTime())) {
      parsedDate = new Date('1900-01-01');  
    }
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');

    return compactFormat ? `${year}${month}${day}` : `${year}-${month}-${day}`;
  }
}

module.exports = dateHelper;