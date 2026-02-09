import { render, screen, fireEvent } from '@testing-library/react'
import { PasswordInput } from '../PasswordInput'
import '@testing-library/jest-dom'

describe('PasswordInput', () => {
  it('renders input with password type by default', () => {
    render(<PasswordInput placeholder="Enter password" />)
    const input = screen.getByPlaceholderText('Enter password')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'password')
  })

  it('toggles password visibility when button is clicked', () => {
    render(<PasswordInput placeholder="Enter password" />)
    const input = screen.getByPlaceholderText('Enter password')
    const button = screen.getByRole('button')

    // Initially hidden
    expect(input).toHaveAttribute('type', 'password')
    expect(button).toHaveAttribute('aria-label', 'Show password')

    // Click to show
    fireEvent.click(button)
    expect(input).toHaveAttribute('type', 'text')
    expect(button).toHaveAttribute('aria-label', 'Hide password')

    // Click to hide
    fireEvent.click(button)
    expect(input).toHaveAttribute('type', 'password')
    expect(button).toHaveAttribute('aria-label', 'Show password')
  })
})
