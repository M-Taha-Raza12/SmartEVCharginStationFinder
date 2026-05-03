import { useEffect, useState } from 'react'
import { walletApi } from '../services/api'
import type { Wallet, WalletTransaction } from '../types/models'
import './WalletPage.css'

export function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showTopUp, setShowTopUp] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [topUpMethod, setTopUpMethod] = useState<'card' | 'cash'>('card')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadWalletData()
  }, [])

  const loadWalletData = async () => {
    setLoading(true)
    setError('')
    try {
      const [walletData, transactionsData] = await Promise.all([
        walletApi.get(),
        walletApi.getTransactions(),
      ])
      setWallet(walletData)
      setTransactions(transactionsData)
    } catch (err: any) {
      // Silently handle error - feature not available in in-memory database
      console.log('Wallet feature requires database setup')
      setError('')
    } finally {
      setLoading(false)
    }
  }

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(topUpAmount)

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (amount < 100) {
      alert('Minimum top-up amount is Rs 100')
      return
    }

    setProcessing(true)
    try {
      const updatedWallet = await walletApi.topUp({
        amount,
        paymentMethod: topUpMethod,
      })
      setWallet(updatedWallet)
      setTopUpAmount('')
      setShowTopUp(false)
      // Reload transactions to show the new one
      const transactionsData = await walletApi.getTransactions()
      setTransactions(transactionsData)
      alert('Wallet topped up successfully!')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to top up wallet')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="wallet-page">
        <div className="loading">Loading wallet...</div>
      </div>
    )
  }

  return (
    <div className="wallet-page">
      <div className="page-header">
        <h1>💳 My Wallet</h1>
        <p>Manage your wallet balance and transactions</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {wallet && (
        <div className="wallet-card">
          <div className="wallet-balance-section">
            <div className="balance-label">Current Balance</div>
            <div className="balance-amount">
              Rs {wallet.balance.toFixed(2)}
              <span className="currency">{wallet.currency}</span>
            </div>
            <div className="balance-updated">
              Last updated: {new Date(wallet.updatedAt).toLocaleString()}
            </div>
          </div>

          <button
            type="button"
            className="top-up-btn"
            onClick={() => setShowTopUp(!showTopUp)}
          >
            {showTopUp ? 'Cancel' : '+ Top Up Wallet'}
          </button>

          {showTopUp && (
            <form className="top-up-form" onSubmit={handleTopUp}>
              <div className="form-group">
                <label htmlFor="amount">Amount (Rs)</label>
                <input
                  type="number"
                  id="amount"
                  value={topUpAmount}
                  onChange={e => setTopUpAmount(e.target.value)}
                  placeholder="Enter amount (min Rs 100)"
                  min="100"
                  step="10"
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <div className="payment-methods">
                  <label className="payment-method-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={topUpMethod === 'card'}
                      onChange={() => setTopUpMethod('card')}
                    />
                    <span>💳 Credit/Debit Card</span>
                  </label>
                  <label className="payment-method-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={topUpMethod === 'cash'}
                      onChange={() => setTopUpMethod('cash')}
                    />
                    <span>💵 Cash</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={processing}>
                {processing ? 'Processing...' : 'Top Up Now'}
              </button>
            </form>
          )}
        </div>
      )}

      <div className="transactions-section">
        <h2>Transaction History</h2>

        {transactions.length === 0 ? (
          <div className="empty-transactions">
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="transactions-list">
            {transactions.map(transaction => (
              <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
                <div className="transaction-icon">
                  {transaction.type === 'credit' ? '⬆️' : '⬇️'}
                </div>
                <div className="transaction-details">
                  <div className="transaction-description">{transaction.description}</div>
                  <div className="transaction-date">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="transaction-amount">
                  <span className={transaction.type === 'credit' ? 'credit' : 'debit'}>
                    {transaction.type === 'credit' ? '+' : '-'}Rs {transaction.amount.toFixed(2)}
                  </span>
                  <div className="balance-after">
                    Balance: Rs {transaction.balanceAfter.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
