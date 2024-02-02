const { readFileSync } = require('fs');
const path = require('path');
const logger = require('./logger.js');
const helper = require('./helper.js');

const reportTemplate = {
	header: function ({heightPx}) {
		return `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta
			name="viewport"
			content="width=device-width, initial-scale=1.0" />
		<title>Rapport</title>
		<style>
			* {
				box-sizing: border-box;
				-webkit-print-color-adjust: exact;
			}
			body {
				font-family: Arial, sans-serif;
				margin: 0;
				padding: 0;
			}
			.page {
				width: 1024px;
				min-height: 1000px;
				padding: 0;
				margin: 210px auto 200px auto;
				position: relative;
			}
			.pageBody {
				padding: 4% 6%;
			}
			.mainBodyTable {
		
				width: 100%;
				border-collapse: collapse;
				

				margin: 0;
			}
			.mainBodyTable th {
				padding: 0;
			}
			.mainBodyTable tfoot td {
				padding: 0;

			}
			.titleTable {
				width: 100%;
				border-collapse: collapse;
				box-shadow: rgba(0, 0, 0, 0.02) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 1px 2px;
				position: absolute;
				top: 0;
				left: 0;
				z-index: 1;
			}

			.neutral {
				width: 100%;
				border-collapse: collapse;
				margin: 0;
				color: #292929 !important;
			}
			
			.titleTable td {
				padding: 0 14px !important;
				color: #ffffff;
				text-align: left;
				font-size: 18px !important;
				font-weight: 500;
			}
			
			.bRight {
				border-right: 1px solid #8fceff44;
			}
			.tdRight {
				border-right: 1px solid #8fceff44;
			}
			
			.relativeContainer {
			position: relative;
			with: 100%;
			}
			#tableHeaderbgImage {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				z-index: -1;
				object-fit: cover;
			}
			.top {
				height: 51px;
			}
			.bottom {
				height: 41px;
			}

			.mainBodyTable #table-body td {
				color: #292929 !important;
				padding: ${heightPx}px 14px;
				font-size: 16px;
			}
			.mainBodyTable #table-body .odd td {
				border-right: 1px solid #ffffff;
				background-color: #e9e9f3 !important;
			}
			.mainBodyTable #table-body #margin-row {
				height: 2px;
				padding: 6px 0;
			}
			.mainBodyTable #table-body #bottom-margin-row {
				height: 2px;
				padding: 12px 0;
			}

		</style>
	</head>
	<body>
		<div class="page">
			<div class="pageBody">
				<table class="mainBodyTable">
					<thead>
						<tr>
							<th colspan="5">
								
								<div class="relativeContainer top">
								<table class="titleTable top">
								<tr>
							<td
								class="bRight"
								width="10%">
								Konto
							</td>
							<td
								class="bRight"
								width="16%">
								Kostnadsställe
							</td>
							<td class="bRight">Beskrivning</th>
							<td
								class="bRight"
								width="18%">
								Debet
							</td>
							<td width="18%">Kredit</td>
							</td>
							</tr>
							</table>

							<img src="data:image/jpeg;base64,${readFileSync(path.join(__dirname, 'tableHeader.jpg')).toString(
								'base64'
							)}" alt="Abstract table header background" id="tableHeaderbgImage" class="top" />
							</div>

							</th>
						</tr>
					</thead>
					<tbody id="table-body">
						<tr>
							<td colspan="5"	id="margin-row">
								
							</td>
						</tr>
					`;
	},

	beginning: function () {
		return `<table class="neutral"><tbody>`;
	},

	ending: function () {
		return `</tbody>
		</table>
	</div>
</div>
</body>
</html>`;
	},

	dataRows: function ({ oddOrNot, account, costCentre, description, debet, kredit }) {
		return `<tr${oddOrNot ? '' : ' class="odd"'}>
							<td width="10%" class="tdRight">${account}</td>
							<td width="16%" class="tdRight">${costCentre}</td>
							<td class="tdRight">${description}</td>
							<td width="18%" class="tdRight">${debet}</td>
							<td width="18%">${kredit}</td>
						</tr>`;
	},
	sumRow: function ({ sumDebet, sumKredit }) {
		return `

				<tr>
							<td
								colspan="5"
								id="bottom-margin-row">
								<!-- Margin row -->
							</td>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<td colspan="2"><!-- Empty cell --></td>
							<td colspan="3">
							<div class="relativeContainer bottom">
								<table class="titleTable bottom">
									<tr>
										<td
											class="tdRight"
											width="51%">
											Summa
										</td>
										<td width="24.5%" class="tdRight">${sumDebet}</td>
										<td>${sumKredit}</td>
									</tr>
								</table>
								<img src="data:image/jpeg;base64,${readFileSync(path.join(__dirname, 'tableHeaderSmall.jpg')).toString(
									'base64'
								)}" alt="Abstract table header background" id="tableHeaderbgImage" class="bottom" />
								</div>
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	</body>
</html>`;
	},

	headTemplate: function ({ docType, date, orgNr, companyName, storeNumber }) {
		try {
			return `
		<style>
			* {
				box-sizing: border-box;
				-webkit-print-color-adjust: exact;
			}
			.pageHeader {
				width: 100%;
				min-height: 150px;
				position: absolute;
				display: flex;
				
				margin: 0;
				z-index: 1;
				top: 0;
				left: 0;
				color: #f5f7f6;
				flex-direction: column;
				align-items: flex-start;
				box-shadow: rgba(0, 0, 0, 0.02) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 1px 2px;
			}
			.title-bar {
				display: flex;
				width: 100%;
				justify-content: space-between;
				align-items: baseline;
				padding-bottom: 8px;
				margin: 0 0 10px;
				position: relative;
				border-bottom: solid 2px #82f3f7;

			}
			#title {
				color: #82f3f7 !important;
				font-size: 30px;
				font-weight: 400;
				-webkit-print-color-adjust: exact;
			}
			#book-date {
				font-size: 16px;
			}
			#date {
				font-size: 18px;
				font-weight: 400;
			}
			.info {
				text-align: left;
				font-size: 16px;
			}
			#company-name {
				font-size: 18px;
				font-weight: 400;
				margin-right: 14px;
			}
			#org-number,
			#store-number {
				font-weight: 400;
				font-size: 18px;
				margin-right: 14px;
			}
			#titleContainer {
				display: flex;
				padding: 6% 6% 2% 6%;
				flex-direction: column;
				color: white !important;
				height: 100%;
				width: 100%;
				position: absolute;
				top: 0;
				left: 0;
				z-index: 1;
				-webkit-print-color-adjust: exact;
			}
			#headBg {
				position: absolute;
				top: 0;
				left: 0;
				z-index: 0;
				opacity: 1;
				width: 100%;
				height: 100%;
				object-fit: cover;
				object-position: 0 0;
			}
		</style>
		<div class="pageHeader">
			<div id="titleContainer">
				<div class="title-bar">
					<span id="title">${docType.toUpperCase()}</span
					><span id="book-date">Bokföringsdatum: <span id="date">${helper.convertDate(date, false)}</span></span>
				</div>
				<div class="info">
					<span id="company-name">${companyName.toUpperCase()}</span> Org: <span id="org-number">${orgNr}</span> Butik:
					<span id="store-number">${storeNumber}</span>
				</div>
			</div>
			<img
				src="data:image/jpeg;base64,${readFileSync(path.join(__dirname, 'headBg.jpg')).toString('base64')}"
				alt="Abstract background image"
				id="headBg" />
		</div>`;
		} catch (error) {
			logger.error({ message: `Head template error: ${error.message}`, metadata: error.stack });
			console.log(error.message);
		}
	},

	footerTemplate: function ({ fileId }) {
		return `
			<style>
			* {
				box-sizing: border-box;
				-webkit-print-color-adjust: exact;
			}
			.footer {
				position: absolute;
				bottom: 0;
				left: 0;
				width: 100%;
				height: 60px;
				padding: 0 6%;
				display: flex;
				justify-content: space-between;
				align-items: center;
				color: #b2b3bb;
				font-size: 14px;
				margin: 0 auto;
				z-index: 1;
			}
			#bgImage {
				position: absolute;
				bottom: 0;
				left: 0;
				width: 100%;
				height: 60px;
				z-index: 0;
				opacity: 1;
				object-fit: cover;
				object-position: 0 0;
			}
		</style>
		<div class="footer"><span>Datafil: ${fileId}</span><span>Rapporten skapad av ExSicon.se</span></div>
		<img
			src="data:image/jpeg;base64,${readFileSync(path.join(__dirname, 'footerBg.jpg')).toString('base64')}"
			alt="Abstract background image"
			id="bgImage" />`;
	},
};

module.exports = reportTemplate;
