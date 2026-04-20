import React from "react";
import "../styles/tally-invoice.css";

// Helper function to convert numbers to words (Indian numbering system)
const numberToWords = (num) => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return;
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim();
};

export default function TallyInvoice({ invoice, items }) {
  const formatNum = (num) => parseFloat(num || 0).toFixed(2);
  const totalInWords = `${numberToWords(Math.round(invoice.total))} Rupees Only`.toUpperCase();

  return (
    <div className="tally-invoice-container" id="printable-invoice">
      <table className="tally-invoice-table desktop-only">
        <tbody>
          <tr>
            <td colSpan="13" className="tally-text-center tally-text-bold tally-title">
              TAX INVOICE
            </td>
          </tr>
          <tr>
            <td colSpan="6" className="tally-cell-pad">
              <div className="tally-business-name">THE ASTRO TECHNOLOGY</div>
              <div>Registered Business Address</div>
              <div>541 A, PHASE 3,VALLALAR, NETHAJI BOSE MAIN ROAD,SATHUVACHARI,VELLORE,Tamil Nadu, 632009</div>
              <div>GSTIN/UIN: <span className="tally-text-bold">33DSRPS2347C1ZL</span></div>
            </td>
            <td colSpan="7" className="tally-cell-pad">
              <div className="tally-split-header">
                <div>Invoice No.: <span className="tally-text-bold">{invoice.invoice_number}</span></div>
                <div>Dated: <span className="tally-text-bold">{new Date(invoice.invoice_date).toLocaleDateString("en-IN")}</span></div>
              </div>
              <div style={{ marginTop: '10px' }}>
                <div>Place of Supply: <span className="tally-text-bold">State Name (29)</span></div>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan="13" className="tally-cell-pad">
              <div>Consignee / Buyer (Bill to):</div>
              <div className="tally-text-bold" style={{ fontSize: '14px', marginTop: '4px' }}>{invoice.customer_name}</div>
              <div>{invoice.customer_address || "Client Address (To be updated)"}</div>
              <div>GSTIN/UIN: <span className="tally-text-bold">{invoice.customer_gstin || "Unregistered"}</span></div>
            </td>
          </tr>
          
          {/* ── Table Header ── */}
          <tr className="tally-text-center tally-text-bold">
            <td rowSpan="2" style={{width: '4%'}}>S.No</td>
            <td rowSpan="2" style={{width: '24%'}}>Description of Goods</td>
            <td rowSpan="2" style={{width: '8%'}}>HSN/SAC</td>
            <td rowSpan="2" style={{width: '6%'}}>Quantity</td>
            <td rowSpan="2" style={{width: '8%'}}>Rate</td>
            <td rowSpan="2" style={{width: '10%'}}>Taxable Value</td>
            <td colSpan="2" style={{width: '12%'}}>CGST</td>
            <td colSpan="2" style={{width: '12%'}}>SGST</td>
            <td colSpan="2" style={{width: '10%'}}>IGST</td>
            <td rowSpan="2" style={{width: '10%'}}>Total</td>
          </tr>
          <tr className="tally-text-center tally-text-bold">
            <td style={{width: '6%'}}>Rate</td><td style={{width: '6%'}}>Amt</td>
            <td style={{width: '6%'}}>Rate</td><td style={{width: '6%'}}>Amt</td>
            <td style={{width: '5%'}}>Rate</td><td style={{width: '5%'}}>Amt</td>
          </tr>

          {/* ── Items List ── */}
          {items.map((item, i) => {
            const qty = parseFloat(item.qty);
            const price = parseFloat(item.price);
            const taxable = qty * price;
            
            // Assume inter-state vs intra-state based on a generic rule, 
            // but usually in billing CGST/SGST are split 50/50 from total GST.
            const gstRate = parseFloat(item.gst_percent || 0);
            const halfGst = (gstRate / 2).toFixed(2);
            const gstAmt = parseFloat(item.gst_amount || 0);
            const halfAmt = formatNum(gstAmt / 2);
            
            return (
              <tr key={i} className="tally-item-row">
                <td className="tally-text-center">{i + 1}</td>
                <td><div className="tally-text-bold">{item.product_name}</div></td>
                <td>{item.hsn_code}</td>
                <td className="tally-text-right"><span className="tally-text-bold">{qty}</span> Nos</td>
                <td className="tally-text-right">{formatNum(price)}</td>
                <td className="tally-text-right">{formatNum(taxable)}</td>
                
                <td className="tally-text-right">{halfGst}%</td>
                <td className="tally-text-right">{halfAmt}</td>
                
                <td className="tally-text-right">{halfGst}%</td>
                <td className="tally-text-right">{halfAmt}</td>
                
                <td className="tally-text-right">-</td>
                <td className="tally-text-right">-</td>
                
                <td className="tally-text-right tally-text-bold">{formatNum(item.amount)}</td>
              </tr>
            );
          })}

          {/* Fill remaining empty space for consistent height if needed */}
          <tr className="tally-empty-row">
            <td></td><td></td><td></td><td></td><td></td><td></td>
            <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
          </tr>

          {/* ── Summary Totals ── */}
          <tr className="tally-text-bold">
            <td colSpan="5" className="tally-text-right">Total</td>
            <td className="tally-text-right">{formatNum(invoice.subtotal)}</td>
            <td colSpan="2" className="tally-text-right">{formatNum(invoice.gst_total / 2)}</td>
            <td colSpan="2" className="tally-text-right">{formatNum(invoice.gst_total / 2)}</td>
            <td colSpan="2" className="tally-text-right">-</td>
            <td className="tally-text-right tally-text-bold">{formatNum(invoice.total)}</td>
          </tr>

          {/* ── Words & Meta ── */}
          <tr>
            <td colSpan="13" className="tally-cell-pad">
              Amount Chargeable (in words)<br/>
              <span className="tally-text-bold">INR {totalInWords}</span>
            </td>
          </tr>
          
          {/* Notes */}
          {invoice.notes && (
            <tr>
              <td colSpan="13" className="tally-cell-pad">
                Remarks:<br/>
                <span>{invoice.notes}</span>
              </td>
            </tr>
          )}

          {/* ── Declarations & Signatures ── */}
          <tr>
            <td colSpan="6" className="tally-cell-pad" style={{verticalAlign: 'bottom', paddingBottom: '10px'}}>
              <div className="tally-text-bold" style={{textDecoration: 'underline'}}>Declaration</div>
              <div style={{fontSize: '11px', marginTop: '4px'}}>
                We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
              </div>
            </td>
            <td colSpan="7" className="tally-text-right tally-cell-pad" style={{verticalAlign: 'top'}}>
              <div className="tally-text-bold">For ASTRO TECHNOLOGY</div>
              <div style={{marginTop: '60px'}}>Authorized Signatory</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── MOBILE VIEW ── */}
      <div className="mobile-invoice-view">
        <div className="m-header">
          <div className="m-title">TAX INVOICE</div>
          <h3>ASTRO TECHNOLOGY</h3>
          <p style={{fontSize:'12px', margin:'4px 0'}}>GSTIN: 33DSRPS2347C1ZL</p>
        </div>
        
        <div className="m-section">
          <p><strong>Inv No:</strong> {invoice.invoice_number}</p>
          <p><strong>Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString("en-IN")}</p>
          <p><strong>Status:</strong> {invoice.status.toUpperCase()}</p>
        </div>

        <div className="m-section">
          <p className="m-subtitle">Bill To:</p>
          <p><strong>{invoice.customer_name}</strong></p>
          <p>{invoice.customer_address || "Client Address (To be updated)"}</p>
          <p>GSTIN: {invoice.customer_gstin || "Unregistered"}</p>
        </div>

        <div className="m-items">
          <p className="m-subtitle">Items:</p>
          {items.map((item, i) => {
             const qty = parseFloat(item.qty);
             const price = parseFloat(item.price);
             return (
               <div key={i} className="m-item-card">
                 <div className="m-item-name">{i+1}. {item.product_name}</div>
                 <div className="m-item-meta">
                   <span>{qty} x Rs. {formatNum(price)}</span>
                   <span>Rs. {formatNum(qty*price)}</span>
                 </div>
                 <div className="m-item-tax">
                   <span>+ GST ({(item.gst_percent || 0)}%)</span>
                   <span>Rs. {formatNum(item.gst_amount || 0)}</span>
                 </div>
                 <div className="m-item-total">
                   <span>Subtotal</span>
                   <span>Rs. {formatNum(item.amount)}</span>
                 </div>
               </div>
             )
          })}
        </div>

        <div className="m-summary">
          <div className="m-sum-row"><span>Subtotal:</span> <span>Rs. {formatNum(invoice.subtotal)}</span></div>
          <div className="m-sum-row"><span>GST Total:</span> <span>Rs. {formatNum(invoice.gst_total)}</span></div>
          <div className="m-sum-row m-total-row"><span>Total:</span> <span>Rs. {formatNum(invoice.total)}</span></div>
          <div className="m-words">INR {totalInWords}</div>
        </div>
      </div>
    </div>
  );
}
