const reportTemplate = {
	header: function () {
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
			}
			body {
				font-family: Arial, sans-serif;
				margin: 0;
				padding: 0;
				background: white;
			}
			.page {
				width: 1024px;
				min-height: 1203px;
				padding: 0;
				margin: 0 auto;
				position: relative;
			}
			.pageBody {
				padding: 2% 6%;
			}
			
			.sumTable {
				width: 100%;
				border-collapse: collapse;
				background: linear-gradient(to right, #102739, #1c252e);
				box-shadow: rgba(0, 0, 0, 0.19) 0px 3px 12px, rgba(0, 0, 0, 0.26) 0px 2px 4px;
			}
			.sumTable td {
				padding: 10px 14px;
				color: white;
				text-align: left;
				font-size: 18px;
				font-weight: 400;
			}
			table {
				width: 100%;
				border-collapse: collapse;
				font-size: 16px;
				color: #292929;
			}
			td {
				text-align: left;
				padding: 10px 14px;
			}
			th {
				padding: 14px;
				color: white;
				text-align: left;
				font-size: 18px;
				font-weight: 400;
			}
			tr {
					page-break-inside: avoid;
			}
			thead {
				background: linear-gradient(to right, #102739, #1c252e);
				box-shadow: rgba(0, 0, 0, 0.19) 0px 3px 12px, rgba(0, 0, 0, 0.26) 0px 2px 4px;
			}
			tfoot td {
				padding: 0;
				color: white;
				text-align: left;
				font-size: 18px;
				font-weight: 400;
			}

			#margin-row {
				height: 2px;
				padding: 6px 0;
			}
			#bottom-margin-row {
				height: 2px;
				padding: 14px 0;
			}
			.bRight {
				border-right: 1px solid #8fceff44;
			}
			.tdRight {
				border-right: 1px solid #e0e0e081;
			}
			tr.odd > td {
				background-color: #e6eaedcc;
				border-right: 1px solid #ffffff;
			}
		</style>
	</head>
	<body>
		<div class="page">
			<div class="pageBody">
				<table>
					<thead>
						<tr>
							<th
								class="bRight"
								width="10%">
								Konto
							</th>
							<th
								class="bRight"
								width="16%">
								Kostnadsställe
							</th>
							<th class="bRight">Beskrivning</th>
							<th
								class="bRight"
								width="18%">
								Debet
							</th>
							<th width="18%">Kredit</th>
						</tr>
					</thead>
					<tbody id="table-body">
						<tr>
							<td
								colspan="5"
								id="margin-row">
								<!-- Margin row -->
							</td>
						</tr>`;
	},
	dataRows: function ({oddOrNot, account, costCentre, description, debet, kredit}) {
		return `<tr${oddOrNot ? ' class="odd"' : ''}>
							<td class="tdRight">${account}</td>
							<td class="tdRight">${costCentre}</td>
							<td class="tdRight">${description}</td>
							<td class="tdRight">${debet}</td>
							<td>${kredit}</td>
						</tr>`;
	},
	sumRow: function ({sumDebet, sumKredit}) {
		return `<tr>
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
								<table class="sumTable">
									<tr>
										<td
											class="tdRight"
											width="51%">
											Summa
										</td>
										<td class="tdRight">${sumDebet}</td>
										<td>${sumKredit}</td>
									</tr>
								</table>
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	</body>
</html>`;
	},


	headTemplate: function ( { docType, date, orgNr, companyName, storeNumber } )
	{
		return `
		<style>
			* {
				margin: 0;
				padding: 0;
				box-sizing: border-box;
			}
			.pageHeader {
				width: 1024px;
				height: 185px;
				position: relative;
				display: flex;
				padding: 6%;
				margin: 0, 0 40px;
				color: #f5f7f6;
				flex-direction: column;
				align-items: flex-start;
				box-shadow: rgba(0, 0, 0, 0.19) 0px 3px 12px, rgba(0, 0, 0, 0.26) 0px 2px 4px;
			}
			.title-bar {
				display: flex;
				width: 100%;
				justify-content: space-between;
				align-items: baseline;
				padding-bottom: 8px;
				margin: 0 0 10px;
				position: relative;
			}
			#title {
				color: #77d5fb;
				font-size: 30px;
				font-weight: 400;
			}
			#book-date {
				font-size: 18px;
			}
			#date {
				font-size: 20px;
				font-weight: 400;
			}
			.info {
				text-align: left;
				font-size: 18px;
			}
			#company-name {
				font-size: 20px;
				font-weight: 400;
				margin-right: 14px;
			}
			#org-number,
			#store-number {
				font-weight: 400;
				font-size: 20px;
				margin-right: 14px;
			}
			#titleContainer {
				display: flex;
				padding: 6%;
				flex-direction: column;

				height: 100%;
				width: 100%;
				position: absolute;
				top: 0;
				left: 0;
				z-index: 1;
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
					<span id="title">${ docType }</span
					><span id="book-date">Bokföringsdatum: <span id="date">${ date }</span></span>
				</div>
				<div class="info">
					<span id="company-name">${ companyName }</span> Org: <span id="org-number">${ orgNr }</span> Butik:
					<span id="store-number">${ storeNumber }</span>
				</div>
			</div>
			<img
				src="https://static.wixstatic.com/media/4c1ddb_487d8022e4ed4dbe9224e1be3226212a~mv2.jpg"
				alt="Abstract background image"
				id="headBg" />
		</div>`;
	},

	footerTemplate: function ({fileId})
	{
		return `
			<style>
			* {
				margin: 0;
				padding: 0;
				box-sizing: border-box;
			}
			.footer {
				position: absolute;
				bottom: 0;
				left: 0;
				width: 1024px;
				height: 60px;
				padding: 0 6%;
				display: flex;
				justify-content: space-between;
				align-items: center;
				color: #707176;
				font-size: 14px;
				margin: 0;
				z-index: 1;
			}
			#bgImage {
				position: absolute;
				bottom: 0;
				left: 0;
				width: 1024px;
				height: 60px;
				z-index: 0;
				opacity: 1;
				object-fit: cover;
				object-position: 0 0;
			}
		</style>
		<div class="footer"><span>Datafil: ${fileId}</span><span>Rapporten skapad av ExSicon.se</span></div>
		<img
			src="https://static.wixstatic.com/media/4c1ddb_81a5954cdbd148e38d790e705be66d24~mv2.jpg"
			alt="Abstract background image"
			id="bgImage" />`
	}
};

module.exports = reportTemplate;
