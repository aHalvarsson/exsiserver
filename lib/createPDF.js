const reportTemplate = require( './reportTemplate.js' );
const logger = require( './logger.js' );

function createPDFhtmlString ( data )
{
  try
  {
    if ( !data ) return null;
    const bodyArray = [];
    const { company = {}, entry = {}, fileInfo = {} } = data;
    const { name, orgNr, store = '' } = company;
    const { fileId, fileType } = fileInfo;
    const { date: entryDate, amount, account, dim, description = [] } = entry;
  
  
    const docType = fileType;
    const date = entryDate;
    const companyName = name;
    const storeNumber = store;

    const headTemplate = reportTemplate.headTemplate( { docType, date, orgNr, companyName, storeNumber } );

    const footerTemplate = reportTemplate.footerTemplate( { fileId } );

    const header = reportTemplate.header();
    bodyArray.push( header );
    bodyArray.push( reportTemplate.beginning() );

    for ( let i = 0; i < account.length; i++ )
    {
      if ( i % 4 === 0 )
      {
        bodyArray.push( reportTemplate.ending() );
        bodyArray.push( reportTemplate.beginning() );
      }
      const oddOrNot = i % 2 === 0;
      const debet = amount[i] > 0 ? amount[i] : '';
      const kredit = amount[i] < 0 ? -amount[i] : '';
      const accountItem = account[i];
      const costCentreItem = dim[i];
      const descriptionItem = !description[i] ? '' : description[i];
      const line = reportTemplate.dataRows({oddOrNot, account: accountItem, costCentre: costCentreItem, description: descriptionItem, debet, kredit});
      bodyArray.push(line);
    }
    bodyArray.push( reportTemplate.ending() );


    const sumDebet = amount.filter( ( a ) => a > 0 ).reduce( ( a, b ) => a + b, 0 );
    const sumKredit = amount.filter( ( a ) => a < 0 ).reduce( ( a, b ) => a + b, 0 );
    const sumDK = reportTemplate.sumRow( { sumDebet, sumKredit } );
    bodyArray.push( sumDK );

    const reportBody = bodyArray.join( '\n' );

    logger.info( {
      message: 'PDF created',
      metadata: { reportBody },
    } );

    return {
      headTemplate,
      reportBody,
      footerTemplate
    }
    
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