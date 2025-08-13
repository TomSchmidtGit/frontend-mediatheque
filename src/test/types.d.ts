import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveClass(className: string): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveValue(value: string | string[] | number): R;
      toBeChecked(): R;
      toBeDisabled(): R;
      toBeEmpty(): R;
      toBeEmptyDOMElement(): R;
      toBePartiallyChecked(): R;
      toBeRequired(): R;
      toBeValid(): R;
      toBeVisible(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(htmlText: string): R;
      toHaveAccessibleDescription(description?: string | RegExp): R;
      toHaveAccessibleName(name?: string | RegExp): R;
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R;
      toHaveFocus(): R;
      toHaveFormValues(expectedValues: Record<string, any>): R;
      toHaveStyle(css: string | Record<string, any>): R;
      toHaveValue(value: string | string[] | number): R;
      toBeEmpty(): R;
      toBeEmptyDOMElement(): R;
      toBePartiallyChecked(): R;
      toBeRequired(): R;
      toBeValid(): R;
      toBeVisible(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(htmlText: string): R;
      toHaveAccessibleDescription(description?: string | RegExp): R;
      toHaveAccessibleName(name?: string | RegExp): R;
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R;
      toHaveFocus(): R;
      toHaveFormValues(expectedValues: Record<string, any>): R;
      toHaveStyle(css: string | Record<string, any>): R;
    }
  }
}

export {};
