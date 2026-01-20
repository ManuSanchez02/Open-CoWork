import { create } from 'zustand'

export interface QuestionOption {
  id: string
  label: string
}

export interface Question {
  id: string
  question: string
  options: QuestionOption[]
  allowCustom: boolean
  selectedOptionId?: string
  customAnswer?: string
}

export interface QuestionSet {
  id: string
  questions: Question[]
  currentIndex: number
  submitted: boolean
}

interface QuestionStore {
  activeQuestionSet: QuestionSet | null

  // Actions
  setQuestions: (questions: Omit<Question, 'selectedOptionId' | 'customAnswer'>[]) => string
  selectOption: (questionId: string, optionId: string) => void
  setCustomAnswer: (questionId: string, answer: string) => void
  nextQuestion: () => void
  prevQuestion: () => void
  submitAnswers: () => Record<string, { selectedOption?: string; customAnswer?: string }>
  clearQuestions: () => void
  hasUnansweredQuestions: () => boolean
}

export const useQuestionStore = create<QuestionStore>((set, get) => ({
  activeQuestionSet: null,

  setQuestions: (questions) => {
    const id = `qs-${Date.now()}`
    set({
      activeQuestionSet: {
        id,
        questions: questions.map((q, i) => ({
          ...q,
          id: q.id || `q-${i}`,
          selectedOptionId: undefined,
          customAnswer: undefined
        })),
        currentIndex: 0,
        submitted: false
      }
    })
    return id
  },

  selectOption: (questionId, optionId) => {
    set((state) => {
      if (!state.activeQuestionSet) return state
      return {
        activeQuestionSet: {
          ...state.activeQuestionSet,
          questions: state.activeQuestionSet.questions.map((q) =>
            q.id === questionId ? { ...q, selectedOptionId: optionId, customAnswer: undefined } : q
          )
        }
      }
    })
  },

  setCustomAnswer: (questionId, answer) => {
    set((state) => {
      if (!state.activeQuestionSet) return state
      return {
        activeQuestionSet: {
          ...state.activeQuestionSet,
          questions: state.activeQuestionSet.questions.map((q) =>
            q.id === questionId ? { ...q, selectedOptionId: undefined, customAnswer: answer } : q
          )
        }
      }
    })
  },

  nextQuestion: () => {
    set((state) => {
      if (!state.activeQuestionSet) return state
      const newIndex = Math.min(
        state.activeQuestionSet.currentIndex + 1,
        state.activeQuestionSet.questions.length - 1
      )
      return {
        activeQuestionSet: {
          ...state.activeQuestionSet,
          currentIndex: newIndex
        }
      }
    })
  },

  prevQuestion: () => {
    set((state) => {
      if (!state.activeQuestionSet) return state
      const newIndex = Math.max(state.activeQuestionSet.currentIndex - 1, 0)
      return {
        activeQuestionSet: {
          ...state.activeQuestionSet,
          currentIndex: newIndex
        }
      }
    })
  },

  submitAnswers: () => {
    const state = get()
    if (!state.activeQuestionSet) return {}

    const answers: Record<string, { selectedOption?: string; customAnswer?: string }> = {}
    for (const q of state.activeQuestionSet.questions) {
      answers[q.id] = {
        selectedOption: q.selectedOptionId
          ? q.options.find((o) => o.id === q.selectedOptionId)?.label
          : undefined,
        customAnswer: q.customAnswer
      }
    }

    set((s) => ({
      activeQuestionSet: s.activeQuestionSet
        ? { ...s.activeQuestionSet, submitted: true }
        : null
    }))

    return answers
  },

  clearQuestions: () => {
    set({ activeQuestionSet: null })
  },

  hasUnansweredQuestions: () => {
    const state = get()
    if (!state.activeQuestionSet || state.activeQuestionSet.submitted) return false
    return state.activeQuestionSet.questions.some(
      (q) => !q.selectedOptionId && !q.customAnswer
    )
  }
}))
