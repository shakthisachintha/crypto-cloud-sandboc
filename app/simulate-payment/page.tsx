'use client';

import { useState, useEffect } from 'react';
import styles from './simulate-payment.module.css';

export enum UsdtCurrencyCode {
  USDT_TRC20 = 'USDT_TRC20',
  USDT_ERC20 = 'USDT_ERC20',
  USDT_BSC = 'USDT_BSC',
  USDT_TON = 'USDT_TON',
  USDT_SOL = 'USDT_SOL',
  USDT_ARB = 'USDT_ARB',
  USDT_OPT = 'USDT_OPT',
  USDT_BASE = 'USDT_BASE',
}

export const UsdtCurrencies = [
  { code: UsdtCurrencyCode.USDT_TRC20, label: 'USDT (TRC20)', description: 'Tron Network' },
  { code: UsdtCurrencyCode.USDT_ERC20, label: 'USDT (ERC20)', description: 'Ethereum Network' },
  { code: UsdtCurrencyCode.USDT_BSC, label: 'USDT (BSC)', description: 'Binance Smart Chain' },
  { code: UsdtCurrencyCode.USDT_TON, label: 'USDT (TON)', description: 'TON Network' },
  { code: UsdtCurrencyCode.USDT_SOL, label: 'USDT (SOL)', description: 'Solana Network' },
  { code: UsdtCurrencyCode.USDT_ARB, label: 'USDT (ARB)', description: 'Arbitrum Network' },
  { code: UsdtCurrencyCode.USDT_OPT, label: 'USDT (OPT)', description: 'Optimism Network' },
  { code: UsdtCurrencyCode.USDT_BASE, label: 'USDT (BASE)', description: 'Base Network' },
];

interface PaymentFormData {
  callbackUrl: string;
  currency: UsdtCurrencyCode;
  amount: string;
  orderId: string;
  invoiceId: string;
  status: 'success' | 'failed';
}

const STORAGE_KEY = 'crypto_cloud_payment_simulator';

export default function SimulatePayment() {
  const [formData, setFormData] = useState<PaymentFormData>({
    callbackUrl: '',
    currency: UsdtCurrencyCode.USDT_BSC,
    amount: '',
    orderId: '',
    invoiceId: '',
    status: 'success',
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ success: boolean; message: string } | null>(null);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (error) {
        console.error('Failed to parse saved data:', error);
      }
    }
  }, []);

  // Save to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      // Create payload object
      const payload = {
        status: formData.status,
        invoice_id: formData.invoiceId,
        amount_crypto: formData.amount,
        currency: formData.currency,
        order_id: formData.orderId,
        token: '',
        invoice_info: 'links_invoice',
      };

      // Send to our proxy API to avoid CORS issues
      const res = await fetch('/api/proxy-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callbackUrl: formData.callbackUrl,
          payload: payload,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResponse({
          success: true,
          message: `Payment webhook sent successfully! Status: ${data.status}. Response: ${data.body || 'No response body'}`,
        });
      } else {
        setResponse({
          success: false,
          message: `Failed to send webhook. ${data.error || `Status: ${data.status} ${data.statusText}`}`,
        });
      }
    } catch (error) {
      setResponse({
        success: false,
        message: `Error sending webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof PaymentFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Crypto Cloud Payment Simulator</h1>
        <p className={styles.subtitle}>
          Simulate payment webhooks for testing your integration
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="callbackUrl" className={styles.label}>
              Callback Webhook URL *
            </label>
            <input
              type="url"
              id="callbackUrl"
              required
              className={styles.input}
              placeholder="https://your-domain.com/api/webhook"
              value={formData.callbackUrl}
              onChange={(e) => handleInputChange('callbackUrl', e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="orderId" className={styles.label}>
              Customer Identifier (order_id) *
            </label>
            <input
              type="text"
              id="orderId"
              required
              className={styles.input}
              placeholder="order_12345"
              value={formData.orderId}
              onChange={(e) => handleInputChange('orderId', e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="invoiceId" className={styles.label}>
              Invoice ID *
            </label>
            <input
              type="text"
              id="invoiceId"
              required
              className={styles.input}
              placeholder="IZY5FACO"
              value={formData.invoiceId}
              onChange={(e) => handleInputChange('invoiceId', e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amount" className={styles.label}>
              USDT Amount *
            </label>
            <input
              type="number"
              id="amount"
              required
              step="0.01"
              min="0"
              className={styles.input}
              placeholder="0.05"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Network *</label>
            <div className={styles.networkGrid}>
              {UsdtCurrencies.map((currency) => (
                <label key={currency.code} className={styles.networkOption}>
                  <input
                    type="radio"
                    name="currency"
                    value={currency.code}
                    checked={formData.currency === currency.code}
                    onChange={(e) =>
                      handleInputChange('currency', e.target.value)
                    }
                    className={styles.radio}
                  />
                  <div className={styles.networkLabel}>
                    <span className={styles.networkName}>{currency.label}</span>
                    <span className={styles.networkDesc}>
                      {currency.description}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Payment Status *</label>
            <div className={styles.statusOptions}>
              <label className={styles.statusOption}>
                <input
                  type="radio"
                  name="status"
                  value="success"
                  checked={formData.status === 'success'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className={styles.radio}
                />
                <span>Success</span>
              </label>
              <label className={styles.statusOption}>
                <input
                  type="radio"
                  name="status"
                  value="failed"
                  checked={formData.status === 'failed'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className={styles.radio}
                />
                <span>Failed</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Sending...' : 'Send Payment Webhook'}
          </button>
        </form>

        {response && (
          <div
            className={`${styles.response} ${
              response.success ? styles.success : styles.error
            }`}
          >
            <h3>{response.success ? '✓ Success' : '✗ Error'}</h3>
            <p>{response.message}</p>
          </div>
        )}

        <div className={styles.info}>
          <h3>ℹ️ How it works</h3>
          <p>
            This simulator sends a POST request to your callback URL with URL-encoded
            form data matching the Crypto Cloud API webhook format.
          </p>
          <details className={styles.details}>
            <summary>View payload structure</summary>
            <pre className={styles.code}>
              {JSON.stringify(
                {
                  status: 'success',
                  invoice_id: 'IZY5FACO',
                  amount_crypto: '0.05',
                  currency: 'USDT_BSC',
                  order_id: 'shakthi_003',
                  token: '',
                  invoice_info: 'links_invoice',
                },
                null,
                2
              )}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
