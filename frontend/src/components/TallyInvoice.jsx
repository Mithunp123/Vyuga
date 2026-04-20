import React from 'react';
import '../styles/tally-invoice.css';

export default function TallyInvoice({ 
  invoiceNo = "VYG-" + Math.floor(Math.random() * 100000000),
  date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  payerName = "Guest User",
  payerEmail = "guest@example.com",
  payerPhone = "+91 0000000000",
  eventName = "Inclusive Innovation Fest",
  baseAmount = 99,
  gstRate = 18,
  paymentId = "pay_xxxxxxxxx"
}) {
  
  // Calculate GST components
  // baseAmount is assumed to be in Rupees here. e.g. 99
  const gstAmount = (baseAmount * gstRate) / 100;
  const totalAmount = baseAmount + gstAmount;

  return (
    <div className="tally-invoice-wrapper" style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div className="tally-invoice-container">
        
        {/* Header Section */}
        <div className="tally-header">
          <div className="tally-logo-container">
            {/* The brand logo/badge */}
            <div className="tally-logo-box">
              VYUGA
            </div>
            
            <div className="tally-company-info">
              <h1>NEXYUGA INNOVATIONS PVT LTD</h1>
              <p>Vellore, Tamil Nadu - 632009</p>
              <p>GSTIN: 33PLACEHOLDER123</p>
              <p>SAC Code: 999291</p>
              <p>Email: vyuga@nexyugainnovations.com</p>
            </div>
          </div>
          
          <div className="tally-invoice-details">
            <h2>TAX INVOICE</h2>
            <p><span>Invoice No:</span> {invoiceNo}</p>
            <p><span>Date:</span> {date}</p>
            <p><span>Reference:</span> {paymentId}</p>
          </div>
        </div>

        {/* Parties Section */}
        <div className="tally-parties">
          <div className="tally-party-box">
            <h3>Bill To (Buyer)</h3>
            <p style={{ fontSize: '16px', color: '#0f172a', fontWeight: 'bold' }}>{payerName}</p>
            <p>{payerEmail}</p>
            <p>{payerPhone}</p>
            <p style={{ marginTop: '8px', color: '#64748b' }}>Place of Supply: Tamil Nadu (33)</p>
          </div>
        </div>

        {/* Particulars Table */}
        <div className="tally-table-container">
          <table className="tally-table">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>S.No</th>
                <th style={{ width: '35%' }}>Description of Service</th>
                <th className="num-col" style={{ width: '10%' }}>SAC</th>
                <th className="num-col">Taxable Value (₹)</th>
                <th className="num-col">CGST 9% (₹)</th>
                <th className="num-col">SGST 9% (₹)</th>
                <th className="num-col">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <strong style={{ color: '#0f172a' }}>Event Registration Fee</strong><br/>
                  <span style={{ fontSize: '13px', color: '#64748b', display: 'inline-block', marginTop: '4px' }}>
                    {eventName}
                  </span><br/>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    VYUGA – Ability Carnival 2026
                  </span>
                </td>
                <td className="num-col">999291</td>
                <td className="num-col">{baseAmount.toFixed(2)}</td>
                <td className="num-col">{(gstAmount / 2).toFixed(2)}</td>
                <td className="num-col">{(gstAmount / 2).toFixed(2)}</td>
                <td className="num-col font-bold text-slate-800">{totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="tally-total-section">
          <div className="tally-totals">
            <div className="tally-total-row">
              <span>Base Amount:</span>
              <span>₹ {baseAmount.toFixed(2)}</span>
            </div>
            <div className="tally-total-row">
              <span>CGST @ 9%:</span>
              <span>₹ {(gstAmount / 2).toFixed(2)}</span>
            </div>
            <div className="tally-total-row">
              <span>SGST @ 9%:</span>
              <span>₹ {(gstAmount / 2).toFixed(2)}</span>
            </div>
            <div className="tally-total-row grand-total">
              <span>Grand Total:</span>
              <span>₹ {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Declaration */}
        <div className="tally-declaration">
          <h4>Declaration</h4>
          <p>
            We declare that this invoice shows the actual price of the services described and that all particulars are true and correct. Tax is payable under the Reverse Charge Mechanism: No.
          </p>
        </div>

        {/* Footer */}
        <div className="tally-footer">
          <p>This is a computer-generated invoice and does not require a physical signature.</p>
          <p>© 2026 VYUGA – Ability Carnival | vyuga.nexyuga.in</p>
        </div>

      </div>
    </div>
  );
}
