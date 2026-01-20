import { useState } from 'react'
import { ChevronLeft, ChevronRight, MessageCircleQuestion } from 'lucide-react'
import { useQuestionStore } from '../../stores/questionStore'
import { cn } from '../../lib/utils'

interface QuestionSliderProps {
  onSubmit: (answers: Record<string, { selectedOption?: string; customAnswer?: string }>) => void
}

export function QuestionSlider({ onSubmit }: QuestionSliderProps) {
  const {
    activeQuestionSet,
    selectOption,
    setCustomAnswer,
    nextQuestion,
    prevQuestion,
    submitAnswers,
    clearQuestions
  } = useQuestionStore()

  const [customInputs, setCustomInputs] = useState<Record<string, string>>({})

  if (!activeQuestionSet || activeQuestionSet.submitted) return null

  const { questions, currentIndex } = activeQuestionSet
  const currentQuestion = questions[currentIndex]
  const isFirstQuestion = currentIndex === 0
  const isLastQuestion = currentIndex === questions.length - 1

  const currentAnswer = currentQuestion.selectedOptionId || currentQuestion.customAnswer
  const canProceed = !!currentAnswer

  const handleOptionSelect = (optionId: string) => {
    selectOption(currentQuestion.id, optionId)
    // Clear custom input when selecting an option
    setCustomInputs((prev) => ({ ...prev, [currentQuestion.id]: '' }))
  }

  const handleCustomInput = (value: string) => {
    setCustomInputs((prev) => ({ ...prev, [currentQuestion.id]: value }))
    if (value.trim()) {
      setCustomAnswer(currentQuestion.id, value.trim())
    }
  }

  const handleSubmit = () => {
    const answers = submitAnswers()
    onSubmit(answers)
    clearQuestions()
  }

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit()
    } else {
      nextQuestion()
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2 text-muted-foreground">
        <MessageCircleQuestion className="h-5 w-5" />
        <span className="text-sm font-medium">Question from assistant</span>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-lg font-medium leading-relaxed">{currentQuestion.question}</h3>
      </div>

      {/* Options */}
      <div className="mb-6 space-y-3">
        {currentQuestion.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionSelect(option.id)}
            className={cn(
              'w-full rounded-xl border-2 p-4 text-left transition-all',
              currentQuestion.selectedOptionId === option.id
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-muted-foreground/50 hover:bg-muted/50'
            )}
          >
            <span className="font-medium">{option.label}</span>
          </button>
        ))}

        {/* Custom answer option */}
        {currentQuestion.allowCustom && (
          <div
            className={cn(
              'rounded-xl border-2 p-4 transition-all',
              currentQuestion.customAnswer
                ? 'border-primary bg-primary/10'
                : 'border-border'
            )}
          >
            <textarea
              placeholder="Or write your own answer..."
              value={customInputs[currentQuestion.id] || currentQuestion.customAnswer || ''}
              onChange={(e) => handleCustomInput(e.target.value)}
              className="w-full resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
              rows={2}
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevQuestion}
          disabled={isFirstQuestion}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-3 font-medium transition-colors',
            isFirstQuestion
              ? 'cursor-not-allowed text-muted-foreground/50'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} of {questions.length}
        </span>

        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={cn(
            'flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-colors',
            canProceed
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'cursor-not-allowed bg-muted text-muted-foreground'
          )}
        >
          {isLastQuestion ? 'Submit' : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>
    </div>
  )
}
