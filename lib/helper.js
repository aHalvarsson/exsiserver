import { v4 as uuidv4 } from 'uuid';

  module.exports = {

  /**
   * Converts the input date into a compact or standard date format.
   *
   * @param {string | number | Date} inputDate - The input date to be converted.
   * @param {boolean} [compactFormat=true] - Indicates whether to return the compact date format. Default is true.
   * @return {string} The converted date in the specified format.
   */
  convertDate: (inputDate, compactFormat = true) => {
    let parsedDate;
    if (typeof inputDate === 'string' && inputDate.length === 8) {
      // Convert YYYYMMDD to YYYY-MM-DD
      const formattedDate = `${inputDate.slice(0, 4)}-${inputDate.slice(4, 6)}-${inputDate.slice(6, 8)}`;
      parsedDate = new Date(formattedDate);
    } else {
      parsedDate = new Date(inputDate);
    }

    if (isNaN(parsedDate.getTime())) {
      return 'Invalid date';
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');

    return compactFormat ? `${year}${month}${day}` : `${year}-${month}-${day}`;
  },


  /**
   * Formats the given number into a string with US number formatting.
   *
   * @param {number} num - the number to be formatted
   * @return {string} the formatted number string
   */
  formNum: (num) => {

      if (num !== undefined && num !== null && num) {
        return num.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      } else {
        return '';
      }
    },

  createTask: (data, type, workFunctions) => {
	const task = function () {
		/**
		 * This function is a promise that resolves to the result of the work function
		 * or rejects if there is an error while executing the work function.
		 */
		return new Promise((resolve, reject) => {
			try {
				/**
				 * Get the work function for the given type.
				 * If no work function is found, throw an error.
				 */
				const workFunction = workFunctions[type];
				if (!workFunction) {
					throw new Error(`No work function found for ${data.itemId}`);
				}

				/**
				 * Execute the work function and resolve the promise with the result.
				 */
				const result = workFunction(data);

				resolve(result);
			} catch (error) {
				/**
				 * If there is an error, reject the promise with the error.
				 */
				reject(error);
			}
		});
	};
	task.id = uuidv4();
	return task;
    },

    takeATimeout: (ms) => {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    },

}