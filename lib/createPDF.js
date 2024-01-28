const reportTemplate = require( './reportTemplate.js' );
const logger = require( './logger.js' );

function createPDFhtmlString ( data )
{
  try
  {
    if ( !data ) return null;
    const reportArray = [];
    const { company = {}, entry = {}, fileInfo = {} } = data;
    const { name, orgNr, store = '' } = company;
    const { fileId, fileType } = fileInfo;
    const { date: entryDate, amount, account, dim, description = [] } = entry;
  
  
    const docType = fileType;
    const date = entryDate;
    const companyName = name;
    const storeNumber = store;
    const header = reportTemplate.header( { docType, date, orgNr, companyName, storeNumber } );
    reportArray.push( header );

    for (let i = 0; i < account.length; i++) {
      const oddOrNot = i % 2 === 0;
      const debet = amount[i] > 0 ? amount[i] : '';
      const kredit = amount[i] < 0 ? -amount[i] : '';
      const accountItem = account[i];
      const costCentreItem = dim[i];
      const descriptionItem = !description[i] ? '' : description[i];
      const line = reportTemplate.dataRows({oddOrNot, account: accountItem, costCentre: costCentreItem, description: descriptionItem, debet, kredit});
      reportArray.push(line);
    }


    const sumDebet = amount.filter( ( a ) => a > 0 ).reduce( ( a, b ) => a + b, 0 );
    const sumKredit = amount.filter( ( a ) => a < 0 ).reduce( ( a, b ) => a + b, 0 );
    const sumDK = reportTemplate.sumRow( { sumDebet, sumKredit } );
    reportArray.push( sumDK );

    const footer = reportTemplate.footer();
    reportArray.push( footer );

    logger.info( {
      message: 'Report created',
    })
    return reportArray.join( '\n' );
    
  } catch ( error )
  {
    logger.error( {
      message: 'Error in createPDFhtmlString',
      metadata: {error},
    } );
    throw error;
  }
}

module.exports = createPDFhtmlString; 