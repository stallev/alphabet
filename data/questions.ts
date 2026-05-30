
import { QuestionsSuite, ComplexityLevel } from '../types';

export const questionsData: QuestionsSuite = {
  "title": "Библейские персонажи и события",
  "questionsList": [
    {
      "id": 1,
      "questionContent": "Кто построил ковчег для спасения своей семьи и животных?",
      "complexityLevel": ComplexityLevel.EASY,
      "answersList": [
        {"id": 1, "value": "Моисей"},
        {"id": 2, "value": "Ной"}, 
        {"id": 3, "value": "Авраам"},
        {"id": 4, "value": "Давид"}
      ],
      "answerType": "ID",
      "rightAnswerId": 2
    },
    {
      "id": 2,
      "questionContent": "Какой персонаж победил великана Голиафа с помощью пращи?",
      "complexityLevel": ComplexityLevel.EASY,
      "answersList": [
        {"id": 1, "value": "Соломон"},
        {"id": 2, "value": "Самсон"}, 
        {"id": 3, "value": "Давид"},
        {"id": 4, "value": "Саул"}
      ],
      "answerType": "ID",
      "rightAnswerId": 3
    },
    {
      "id": 3,
      "questionContent": "Сколько дней и ночей длился всемирный потоп?",
      "complexityLevel": ComplexityLevel.MEDIUM,
      "answersList": [
        {"id": 1, "value": "7 дней"},
        {"id": 2, "value": "12 дней"}, 
        {"id": 3, "value": "40 дней"},
        {"id": 4, "value": "100 дней"}
      ],
      "answerType": "ID",
      "rightAnswerId": 3
    },
    {
      "id": 4,
      "questionContent": "Кто из пророков был брошен в львиный ров, но остался невредим?",
      "complexityLevel": ComplexityLevel.MEDIUM,
      "answersList": null,
      "answerType": "String",
      "rightAnswerString": "Даниил"
    },
    {
      "id": 5,
      "questionContent": "Кто был первым царем Израиля?",
      "complexityLevel": ComplexityLevel.HARD,
      "answersList": [
        {"id": 1, "value": "Саул"},
        {"id": 2, "value": "Давид"}, 
        {"id": 3, "value": "Соломон"},
        {"id": 4, "value": "Иеровоам"}
      ],
      "answerType": "ID",
      "rightAnswerId": 1
    },
    {
      "id": 6,
      "questionContent": "Как звали жену Авраама, родившую Исаака в глубокой старости?",
      "complexityLevel": ComplexityLevel.EASY,
      "answersList": null,
      "answerType": "String",
      "rightAnswerString": "Сарра"
    },
    {
      "id": 7,
      "questionContent": "Какое море разделил Моисей перед израильтянами?",
      "complexityLevel": ComplexityLevel.MEDIUM,
      "answersList": null,
      "answerType": "String",
      "rightAnswerString": "Чермное"
    },
    {
      "id": 8,
      "questionContent": "В каком городе родился Иисус Христос?",
      "complexityLevel": ComplexityLevel.EASY,
      "answersList": null,
      "answerType": "String",
      "rightAnswerString": "Вифлеем"
    }
  ]
};
