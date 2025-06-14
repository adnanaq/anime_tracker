import type { Meta, StoryObj } from '@storybook/react'

// Simple example component for testing
const ExampleComponent = ({ text }: { text: string }) => {
  return <div className="p-4 bg-gray-800 text-white rounded">{text}</div>
}

const meta: Meta<typeof ExampleComponent> = {
  title: 'Example/Test',
  component: ExampleComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    text: 'Storybook is working!',
  },
}