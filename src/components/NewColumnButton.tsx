import React, { useState } from 'react';

/**
 * Props for the NewColumnButton component
 * @interface NewColumnButtonProps
 * @property {function} onAdd - Callback function called when a new column is added
 * with the column title as parameter
 */
interface NewColumnButtonProps {
  onAdd: (title: string) => void;
}

/**
 * NewColumnButton component that provides UI for adding new columns to the board
 * Toggles between a button and an input form for creating new columns
 *
 * @component
 * @param {NewColumnButtonProps} props - The component props
 * @returns {JSX.Element} Rendered NewColumnButton component
 *
 * @example
 * ```tsx
 * <NewColumnButton onAdd={(title) => handleNewColumn(title)} />
 * ```
 */
export const NewColumnButton: React.FC<NewColumnButtonProps> = ({ onAdd }) => {
  /** State to track if the input form is visible */
  const [isAdding, setIsAdding] = useState(false);
  /** State to track the new column title input value */
  const [title, setTitle] = useState('');

  /**
   * Handles form submission for creating a new column
   * Validates the title and calls onAdd if valid
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
      setIsAdding(false);
    }
  };

  // Render input form when adding a new column
  if (isAdding) {
    return (
      <div className="flex-shrink-0 w-72 bg-white/10 dark:bg-black/20 backdrop-blur-lg rounded-xl shadow-lg p-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter column title..."
            className="w-full px-3 py-2 bg-white/10 dark:bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setTitle('');
              }}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 dark:bg-black/30 dark:hover:bg-black/40 rounded-lg text-white/80 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Render add column button when not in adding state
  return (
    <button
      onClick={() => setIsAdding(true)}
      className="flex-shrink-0 w-72 h-[50px] bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 backdrop-blur-lg rounded-xl shadow-lg transition-colors flex items-center justify-center group"
      aria-label="Add new column"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-white/50 group-hover:text-white/80 transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  );
};