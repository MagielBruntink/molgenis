// @flow
import type { QuestionnaireState, Chapter } from '../flow.types.js'

function InvalidChapterIdException (chapterId: string) {
  this.chapterId = chapterId
  this.name = 'InvalidChapterIdException'
}

(InvalidChapterIdException.prototype: any).toString = function () { return 'Unknown chapterId (' + this.chapterId + ')' }

function InvalidQuestionIdException (questionId: string) {
  this.questionId = questionId
  this.name = 'InvalidQuestionIdException'
}

(InvalidQuestionIdException.prototype: any).toString = function () { return 'Unknown questionId (' + this.questionId + ')' }

const isFilledInValue = (value): boolean => {
  if (value === undefined) return false
  if (Array.isArray(value) && value.length === 0) return false
  return value !== ''
}

const isChapterComplete = (chapter: Object, formData: Object): boolean => {
  return chapter.children.every(child => {
    if (child.type === 'field-group') {
      return isChapterComplete(child, formData)
    }

    const visible = child.visible(formData)
    if (!visible) return true

    const value = formData[child.id]
    const filledInValue = isFilledInValue(value)
    const required = child.required(formData)
    const valid = child.validate(formData)

    if (filledInValue) {
      const inRange = child.range ? value => child.range.min && value <= child.range.max : true
      return valid && inRange
    } else {
      return valid && !required
    }
  })
}

const getTotalNumberOfFieldsForChapter = (chapter, formData) => {
  return chapter.children.reduce((accumulator, child) => {
    if (child.type === 'field-group') {
      return accumulator + getTotalNumberOfFieldsForChapter(child, formData)
    }

    let visible = false
    try {
      visible = child.visible(formData)
    } catch (e) {
      console.error(`Error in getters.getTotalNumberOfFieldsForChapter, during evaluation of function 'visible' for field ${child.id}.
      Where visible expression is: 
        '${child.visible.toString()}'
      And formData is: 
        '${JSON.stringify(formData)}'
      The default value of visible is set to false`, e)
    }

    if (visible) {
      accumulator++
    }

    return accumulator
  }, 0)
}

const getNumberOfFilledInFieldsForChapter = (chapter, formData) => {
  return chapter.children.reduce((accumulator, child) => {
    if (child.type === 'field-group') {
      return accumulator + getNumberOfFilledInFieldsForChapter(child, formData)
    }

    if (isFilledInValue(formData[child.id])) {
      accumulator++
    }

    return accumulator
  }, 0)
}

const getQuestionById = (chapters: Array<Chapter>, questionId: string) => {
  const findQuestion = (accumulator, question) => {
    if (question.id === questionId) {
      accumulator = question
    } else {
      if (question.children) {
        accumulator = question.children.reduce(findQuestion, accumulator)
      }
    }
    return accumulator
  }

  const topLevelQuestions = chapters.reduce((questions, chapter) => {
    return chapter.children ? questions.concat(chapter.children) : questions
  }, [])

  const question = topLevelQuestions.reduce(findQuestion, null)

  if (question) {
    return question
  } else {
    throw new InvalidQuestionIdException(questionId)
  }
}

const getters = {
  getChapterByIndex: (state: QuestionnaireState): Function => (index: number) => {
    return state.chapters[index - 1]
  },

  getChapterCompletion: (state: QuestionnaireState): Object => {
    return state.chapters.reduce((accumulator, chapter) => {
      accumulator[chapter.id] = isChapterComplete(chapter, state.formData)
      return accumulator
    }, {})
  },

  getChapterNavigationList: (state: QuestionnaireState): Array<*> => {
    return state.chapters.map((chapter, index) => ({id: chapter.id, label: chapter.label, index: (index + 1)}))
  },

  getChapterProgress: (state: QuestionnaireState): Object => {
    return state.chapters.reduce((accumulator, chapter) => {
      const totalNumberOfFieldsInChapter = getTotalNumberOfFieldsForChapter(chapter, state.formData)
      const numberOfFilledInFieldsInChapter = getNumberOfFilledInFieldsForChapter(chapter, state.formData)

      accumulator[chapter.id] = (numberOfFilledInFieldsInChapter / totalNumberOfFieldsInChapter) * 100
      return accumulator
    }, {})
  },

  getQuestionnaireDescription: (state: QuestionnaireState): string => {
    return state.questionnaire.meta && state.questionnaire.meta.description
  },

  getQuestionnaireId: (state: QuestionnaireState): string => {
    return state.questionnaire.meta && state.questionnaire.meta.name
  },

  getQuestionnaireLabel: (state: QuestionnaireState): string => {
    return state.questionnaire.meta && state.questionnaire.meta.label
  },

  getTotalNumberOfChapters: (state: QuestionnaireState): number => {
    return state.chapters.length
  },

  isSaving: (state: QuestionnaireState): boolean => {
    return state.numberOfOutstandingCalls > 0
  },

  getChapterLabel: (state: QuestionnaireState): Function => (chapterId: string) => {
    const chapter = state.chapters.find((chapter) => chapter.id === chapterId)
    if (chapter) {
      return chapter.label
    } else {
      throw new InvalidChapterIdException(chapterId)
    }
  },

  getQuestionLabel: (state: QuestionnaireState): Function => (questionId: string) => {
    return getQuestionById(state.chapters, questionId).label
  }
}

export default getters
