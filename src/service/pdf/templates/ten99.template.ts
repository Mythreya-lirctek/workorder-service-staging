export function ten99HTML(result: any): any {
	try {
		let htmlString = '';
		const j = 3;
		for (let i = 0; i < result.length; i++) {
			if (i >= 1) {
				htmlString += '<div style="display: block; page-break-before: always;"></div>';
			}
			htmlString += `
			 <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "http://www.w3.org/TR/REC-html40/loose.dtd">
			 <html lang="en" >
			  <head>
			   <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
			   <meta charset="UTF-8">
			   <title>1099</title>
			  </head>
			  <body style="font-size:10px;width:100%;">
			  <div style ="position:relative;">
			  <img width="99%" src="https://lircteksams.s3.amazonaws.com/Company/227/CompanyExpenses/1642663504" />
			  <div style="position:absolute;left:30px;top:${(60 + j)}px;font-size:small;">${result[i][0].payersName ? result[i][0].payersName : ''}</div>
			  <div style="position:absolute;left:30px;top:${(80 + j)}px;font-size:small;">${result[i][0].payersAddress ? result[i][0].payersAddress : ''}</div>
			  <div style="position:absolute;left:30px;top:${(100 + j)}px;font-size:small;">${result[i][0].payersCity ? result[i][0].payersCity : ''} ,  ${result[i][0].payersState ? result[i][0].payersState : ''}${result[i][0].payersZip ? result[i][0].payersZip : ''}</div>
			  <div style="position:absolute;left:600px;top:${(110 + j)}px;font-size:small;">22</div>
			  <div style="position:absolute;left:30px;top:${(150 + j)}px;font-size:small;">${(result[i][0].payersTin ? result[i][0].payersTin : '')}</div>
			  <div style="position:absolute;left:215px;top:${(150 + j)}px;font-size:small;">${result[i][0].recepientsTin ? result[i][0].recepientsTin : ''}</div>
			  <div style="position:absolute;left:30px;top:${(195 + j)}px;font-size:small;">${result[i][0].recepientsName ? result[i][0].recepientsName : ''}</div>
			  <div style="position:absolute;left:30px;top:${(235 + j)}px;font-size:small;">${result[i][0].recepientsAddress ? result[i][0].recepientsAddress : ''}</div>
			  <div style="position:absolute;left:30px;top:${(270 + j)}px;font-size:small;">${result[i][0].recepientsCity ? result[i][0].recepientsCity : ''} ${result[i][0].recepientsState ? result[i][0].recepientsState : ''} ${result[i][0].recepientsZip ? result[i][0].recepientsZip : ''} </div>
			  <div style="position:absolute;left:450px;top:${(150 + j)}px;font-size:small;">
			  <span style="text-align:right;">
              ${(result[i][0].totalAmount ? result[i][0].totalAmount.toFixed(2) : 0)}
              <span>
              </div>
			  <div style="position:absolute;left:540px;top:${(290 + j)}px;font-size:small;">
			  <span style="text-align:right;">
                  ${(result[i][0].payersStateTaxId ? result[i][0].payersStateTaxId : '')}
              <span>
              </div>
              <div style="position:absolute;left:540px;top:${(290 + j)}px;font-size:small;">
              <span style="text-align:right;">
                ${(result[i][0].payersStateTaxId ? result[i][0].payersStateTaxId : '')}
              <span>
              </div>
			<div>
			</div>
			</div>
			</body>
			`
		}
		htmlString += '</html>';
		return htmlString;
	} catch (e) {
		return 'Error occured while printing 1099, please try again or contact our customer support';
	}
}