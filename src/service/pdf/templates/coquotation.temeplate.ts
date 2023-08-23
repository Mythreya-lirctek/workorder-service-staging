import moment from 'moment';
export default  function coQuotationHTML(result:any):any{
	const logourl = result.rateCon.brokerageCompanyLogo ? `https://lircteksams.s3.amazonaws.com/${result.rateCon.brokerageCompanyLogo}`:'';
	return `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "http://www.w3.org/TR/REC-html40/loose.dtd">
       <html lang="en" >
        <head> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta charset="UTF-8">
         <title>Invoice</title> </head>
          <body style="color: #000 !important; font-family: Arial, Helvetica, sans-serif; font-size: 10px; line-height: 1.42857143; background-color: #fff; margin: 20px;" bgcolor="#fff">
          <table width="100%" style="font-size:15px;">
           <tr>
            <td style="padding-right:10px; font-size: 20px; font-weight: bold;font-family: Arial" align="center"> Carrier Load Quotation - <span style="font-size: 20px;">
             ${result.rateCon.coNumber}</span> 
             </td> 
           </tr> 
            </table>
		    <br>
		    <table style="width:100%;font-size:10px;font-family: Arial;"> 
		   <tr> 
		    <td style="padding-right: 0px;" valign="top">
		     <img style="align:top;max-height: 60px;" src="${logourl}"> 
		   </td> <td style="padding-left: 0px;font-size:15px;text-align:left;" width="50%" valign="top">
		    <span > <b style="font-size:18px;"> ${result.rateCon.brokerageCompanyName} </b><br> ${result.rateCon.address1} , ${result.rateCon.address2 ? result.rateCon.address2 : ''}  <br> ${result.rateCon.city},${result.rateCon.state} ${result.rateCon.zip} <br><b>Ph: </b> ${result.rateCon.phone}  ${result.rateCon.fax?`<b><br>  Fax:</b> ${result.rateCon.fax}`:''} <b><br>  Email:</b> ${result.rateCon.email}</td>
		    <td width="30%" style="font-size: 15px;" valign="top">
		    <span><b>Order #: </b> ${result.rateCon.coNumber} <br><b>Equipment type:</b>  ${result.rateCon.equipment}<br><b>Load type:</b> ${result.rateCon.loadType?result.rateCon.loadType:''} <br><b>Miles:</b> ${(result.rateCon.miles ? result.rateCon.miles : 0)}<br><b>Temp:</b> ${(result.rateCon.temperature ? `<b>${result.rateCon.temperature}</b>` : '')} </span></td></tr></table>
		   <br>
		    <table style="font-size:15px;border-collapse: separate; border-spacing: 0; width: 100%; font-family: Arial">
		     <tr> 
		     <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; border-left: 1px solid #bbb; background: #eee; border-top: 1px solid #bbb; text-align: left; border-top-left-radius: 6px;border-top-right-radius: 6px;" width="100%" colspan="3">Carrier Info</th>
		     </tr> 
		     <tr> 
		     <td width= "35%" style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;border-bottom-left-radius: 6px;" valign="top"><b style="font-size: 15px;">${result.rateCon.carrierName}</b> <br> ${result.rateCon.carrierAddress1} ${(result.rateCon.carrierAddress2 ? `,   ${result.rateCon.carrierAddress2}` : '')}  <br> ${result.rateCon.carrierCity} , ${result.rateCon.carrierState} ${result.rateCon.carrierZip}</td>
		     <td width="25%" style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">
		      <b style="font-size: 12px">Contact: </b> ${(result.rateCon.contactPerson ? result.rateCon.contactPerson : '')} <br> 
		      <b style="font-size: 12px">Ph: </b> ${(result.rateCon.carrierPhone ? result.rateCon.carrierPhone : '')} 
		      ${result.rateCon.carrierFax ?`<br> <b style="font-size: 12px">Fax: </b> ${(result.rateCon.carrierFax)}`:''}
		      <br> 
		      <b style="font-size: 12px">Email: </b>${(result.rateCon.carrierEmail ? result.rateCon.carrierEmail : '')}</td> 
		      <td width="20%" style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;padding-top:0px;border-bottom-right-radius: 6px;" valign="top"> 
		      <b style="font-size: 12px">Driver : </b>${(result.rateCon.driverName ? result.rateCon.driverName : '')} 
		      <br> 
		      <b style="font-size: 12px">Cell #: </b>${(result.rateCon.driverPhoneNumber ? result.rateCon.driverPhoneNumber : '')} 
		      <br> 
		      <b style="font-size: 12px">Truck: </b>${(result.rateCon.truckNumber ? result.rateCon.truckNumber : '')}</td> 
		      </tr> 
		      </table>
		      ${(result.rateCon.specialInstruction ? `<p><b>Notes:</b>${result.rateCon.specialInstruction}</p>` : '')}
		      ${stopsHtml(result.stops)}
		      <br>
		      <br>
		      <table style="border-collapse: separate; border-spacing: 0; width: 100%; font-family: Arial">
		       <tr> <td width="50%" valign="top"> <table style="border-collapse: separate; border-spacing: 0; width: 100%;font-size:15px;">
		        <tr>
		         <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; border-left: 1px solid #bbb; background: #eee; border-top: 1px solid #bbb; text-align: left; border-top-left-radius: 6px;border-top-right-radius: 6px;" colspan="4">Amount Info</th>
		        </tr>
		          ${lineItemsHtml(result.lineItems)}
		          </td>
		           <td style="padding-left:10px;" valign="top"> <table style="border-collapse: separate; border-spacing: 0; width: 100%; ">
		            <tr>
		             <th style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px; border-left: 1px solid #bbb; background: #eee; border-top: 1px solid #bbb; text-align: left; border-top-left-radius: 6px;border-top-right-radius: 6px;" width="50%">Bill To</th>
		              </tr>
		               <tr>
		                <td style="font-size:15px;border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;border-bottom-left-radius: 6px;">
		                <b style="font-size: 14px;">${result.rateCon.brokerageCompanyName}</b>
		                 <br>${result.rateCon.address1 } ${(result.rateCon.address2 ? result.rateCon.address2 : '')} 
		                 <br>${result.rateCon.city} ${result.rateCon.state} ${result.rateCon.zip}<br> 
		                 <b style="font-size: 12px">Ph: </b>${(result.rateCon.phone?result.rateCon.phone:'')}
		                 ${result.rateCon.fax?`<br> 
		                 <b style="font-size: 12px;">Fax: </b>${(result.rateCon.fax)} `:''}
		                 <br> 
		                 <b style="font-size: 12px">Email: </b>${ result.rateCon.email}</td> 
		                 </tr> 
		                 </table> 
		                 </td> 
		                 </tr> 
		                 </table>
		                 ${result.rateCon.termsAndConditions ? `<p style="font-size: 13px;"><b style="font-size: 13px;">Terms & Conditions:</b><br>${result.rateCon.termsAndConditions}</p>`:''}
                      <table width="100%">
                      <tr valign="top">
                      <td>  ${result.rateCon.brokerageCompanyName} <br>
                      <br>by:________________________________</td>
                      <td></td><td style="text-align:right;">
                      ${result.rateCon.carrierName }<br>
                      <br>by:X_________________________________<br>
                      <br>
                      <b style="font-size: 12px">Driver : </b>
                      <span width="10%">
                      ${result.rateCon.driverName ? result.rateCon.driverName:'_________________________________'}
                      </span><br> <br> 
                      <b style="font-size: 12px">Cell #: </b>${(result.rateCon.driverPhoneNumber ? result.rateCon.driverPhoneNumber : '_________________________________')}
                      <br>
                      <br>
                      <b style="font-size: 12px">Truck: </b>${(result.rateCon.truckNumber ? result.rateCon.truckNumber : '_________________________________')}</td>
                      </tr>
                      </table><footer><p style="text-align: end;">Powered by: <a target="blank" style="vertical-align: sub;" href="https://www.awako.ai/"><img style="height: 19px;" src="https://app.awako.ai/images/logos/logo-4.png">
                      </a></p>
                      </footer>
                      </body>
                       </html>`;
};

function stopsHtml (stops:any):any {

	const content  = stops.map((stop:any,i:any)=>{
		let typeText = 'PU';
		let hoursText = 'Shipping Hours';
		if (stop.stopType === 'Delivery') {
			typeText = 'CO';
			hoursText = 'Receiving Hours';
		}
		let pallets = 0;
		let pieceCt = 0;
		let weight = 0;
		let length = 0;
		const  stopItems = stop.stopItems.map((stopItem:any)=>{
			const stopItemsData=`<tr style="font-size:15px;">
              <td style="padding-left: 5px;border-right: 1px dotted #bbb;">${(stopItem.itemNumber ? stopItem.itemNumber : '')}</td>
              <td style="padding-left: 5px;border-right: 1px dotted #bbb;">${(stopItem.poNumber ? stopItem.poNumber : '')}</td>
              <td style="padding-left: 5px;border-right: 1px dotted #bbb;">${(stopItem.coNumber ? stopItem.coNumber : '') }</td>
              <td style="padding-left: 5px;border-right: 1px dotted #bbb;"> ${(stopItem.commodity ? stopItem.commodity : '') }</td>
              <td style="padding-left: 5px;border-right: 1px dotted #bbb;">${(stopItem.weight ? stopItem.weight : '')}</td>
              <td style="padding-left: 5px;border-right: 1px dotted #bbb;">${(stopItem.pallets ? stopItem.pallets : '')}</td>
              <td style="padding-left: 5px;border-right: 1px dotted #bbb;">${(stopItem.pieceCount ? stopItem.pieceCount : '')}</td>
              <td style="padding-left: 5px;">${(stopItem.trailerTemperature ? stopItem.trailerTemperature : '')}</tr>`;
			pallets += stopItem.pallets;
			pieceCt += stopItem.pieceCount;
			weight += stopItem.weight;
			length += stopItem.length;
			return stopItemsData;
		}).join('')

		const tableData = `<table style="font-family: Arial;border-collapse: separate; border-spacing: 0; width: 100%;font-size:10px; ">
          ${(i===0)?'<tr> <th style="font-size:12px;border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 2px; border-left: 1px solid #bbb; background: #eee; border-top: 1px solid #bbb; text-align: left; border-top-left-radius: 6px;border-top-right-radius: 6px;padding-top:2px;">Stops</b></p></th></tr>':''}
          ${(i !== (stops.length -1))?('<tr> <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;"> <table style="width: 100%; max-width: 100%;font-size:10px;">'):('<tr> <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;border-bottom-left-radius: 6px;border-bottom-right-radius: 6px;"> <table style="width: 100%; max-width: 100%;font-size:10px;">')}
         <tr>
          <td style="font-size:15px;"><b style="font-size: 14px;">${(i + 1)}. ${stop.name }'</b>
          <b style="font-size:10px;text-transform: uppercase;">${stop.stopType}</b> <br>
          <span style="padding-top:5px;font-size: 15px">${stop.address1} ${stop.address2 ? stop.address2 :'' } <br> ${stop.city}, ${stop.state} ${stop.zip}</span>(${(stop.phone ? `<br><b>Ph: </b> ${stop.phone} ${(stop.phoneExt ? `Ext- ${stop.phoneExt} `:'')}`: '')}) </td><td style="width:45%; font-size: 15px;" valign="top">
          <b style="font-size: 12px;">${typeText} #: </b>${(stop.poNumber ? stop.poNumber : '')} ${(stop.appNumber ? `<br><b style="font-size: 12px;">Appt #: </b> ${stop.appNumber}` : '')} <br><b style="font-size: 12px;">Date & Time: </b> ${moment(stops[i].fromDate).format('MM/DD/YYYY')} ${((stop.toDate && (stop.toDate !== '0000-00-00 00:00:00')) ? ` - ${moment(stop.toDate).format('MM/DD/YYYY')}` : '')} ${((stop.fromTime && (stop.fromTime !== '0000-00-00 00:00:00')) ? moment(stop.fromTime).format('HH:mm') : '')} ${((stop.toTime && (stop.toTime !== '0000-00-00 00:00:00')) ? ` - ${moment(stop.toTime).format('HH:mm')}` : '')}  ${(stop.shippingHours ? `'<br><b> ${hoursText}: </b> ${stop.shippingHours}` : '')}</td></tr>
          ${ (stop.notes ? `<tr><td colspan="1"><br><b>Notes: </b>${stop.notes}</td></tr>` : '') }
          ${((stop.stopItems.length > 0 ? '<tr> <td colspan="2"> <table width="100%" style="padding-top: 15px;padding-left: 10px;padding-right: 10px;padding-bottom: 10px;font-size:10px; border-spacing: 0;"> <tr> <td width="15%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>ItemNumber</b> </td> <td width="10%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>PO#</b> </td> <td width="10%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>CO#</b> </td> <td width="20%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>Commodity</b> </td> <td width="10%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>Weight</b> </td> <td width="10%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>Pallets</b> </td> <td width="10%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;border-right: 1px dotted #bbb;"> <b>Count</b> </td> <td width="25%" style="padding-left: 5px;border-bottom: 1px dotted #bbb;"> <b>Temp</b> </td> </tr>' : ''))}
           ${stopItems}
           ${stop.stopItems.length?`<tr><td colspan="4" style="text-align:right;padding-left: 5px;border-right: 1px dotted #bbb;"><b>Total</b></td><td style="padding-left: 5px;border-right: 1px dotted #bbb;"><b>${weight}</b></td><td style="padding-left: 5px;border-right: 1px dotted #bbb;"><b>${pallets}</b></td><td style="padding-left: 5px;border-right: 1px dotted #bbb;"><b>${pieceCt}</b></td></tr></table></td></tr>`:''}           
           </table></td> </tr> </table>`

		return tableData;
	})

	return `<br> ${content.join('')}`;
}
/**
 * Function to return the parsed Html String with Carrier Line Items
 * @param {*} lineItems
 */
function lineItemsHtml(lineItems:any):any {
	let htmlString = '';
	let total = 0;

	if (lineItems.length > 0) {
		htmlString = `<tr style="font-size: 13px; font-weight: bold;">
     <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;">Description</td> 
     <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">Units</td>
     <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">Per</td>
     <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;" align="right">Amount</td> 
   </tr>
   ${
			lineItems.map((lineItem:any)=>{
				const lineItemsHtmlContent =(`<tr style="font-size: 15px">
                   <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;">${lineItem.name}</td>
                    <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${(lineItem.units ? lineItem.units : '')}</td>
                    <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;">${lineItem.per} ${(lineItem.name === 'DispatchFee' ? '%' : '')}</td>
                    <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;" align="right">${(lineItem.name === 'DispatchFee' ? '-' : '')} $ ${lineItem.amount }</td>
                    </tr>`);
				if (lineItem.name === 'DispatchFee'){
					total -= lineItem.amount;
				}
				else {
					total += lineItem.amount;
				}
				return lineItemsHtmlContent;

			}).join('')
		}
         <tr> <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-left: 1px solid #bbb;border-bottom-left-radius: 6px;" colspan="3" align="right" ><b style="font-size: 17px;">Total</b></td> <td style="border-right: 1px solid #bbb; border-bottom: 1px solid #bbb;padding: 5px;border-bottom-right-radius: 6px;" align="right"><b style="font-size: 14px;">$${total.toFixed(2)}</b></td> </tr></table>`
	}

	return htmlString;
}