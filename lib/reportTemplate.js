const reportTemplate = {
	header: function ({ docType, date, orgNr, companyName, storeNumber }) {
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
				min-height: 1448px;
				padding: 0;
				margin: 0 auto;
				box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
				position: relative;
			}
			.pageBody {
				padding: 2% 6%;
			}
			.pageHeader {
				width: 100%;
				height: 185px;
				background-image: url('headBg.jpg');
				background-repeat: no-repeat;
				background-size: cover;
				background-position: center;
				display: flex;
				padding: 6%;
				margin-bottom: 40px;
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
			.title-bar:after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 0;
				width: 100%;
				height: 2px;
				background: linear-gradient(to right, #77d5fb, #9ea3a6);
				opacity: 0.9;
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

			.footer {
				position: absolute;
				bottom: 0;
				width: 100%;
				height: 60px;
				background-image: url('footerBg.jpg');
				background-position: center;
				background-repeat: no-repeat;
				background-size: cover;
				padding: 0 6%;
				display: flex;
				justify-content: flex-end;
				align-items: center;
				color: #707176;
				font-size: 14px;
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
			<div class="pageHeader">
				<div class="title-bar">
					<span id="title">${docType}</span
					><span id="book-date">Bokföringsdatum: <span id="date">${date}</span></span>
				</div>
				<div class="info">
					<span id="company-name">${companyName}</span> Org: <span id="org-number">${orgNr}</span> Butik:
					<span id="store-number">${storeNumber}</span>
				</div>
			</div>
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
			</div>`;
	},
	footer: function () {
		return `<div class="footer">
				<span>Rapporten skapad av ExSicon.se</span>
			</div>
		</div>
	</body>
</html>`;
	},
};

module.exports = reportTemplate;
