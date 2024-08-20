// const securityButtons = {
//     "333": [{text: commandsData.moderator}],
//     "777": [{text: commandsData.admin}]
// }

// const controlButtons = (entity) => {
//     const keyboard = [
//         [{text: commandsData.removeAllList(entity)}],
//         [{text: commandsData.showAllList(entity)}],
//         [{text: commandsData.add(entity)}, {text: commandsData.remove(entity)}],
//         [{text: commandsData.back}]
//     ];
//     return {
//         reply_markup: JSON.stringify({
//             keyboard
//         })
//     }
// }

// const confirmationButtons ={
//     reply_markup: JSON.stringify({
//         keyboard: [
//             [{text: commandsData.yes}, {text: commandsData.no}],
//             [{text: commandsData.back}]
//         ]
//     })
// }

// const paymentButton = {
//     reply_markup: JSON.stringify({
//         inline_keyboard: [
//             [{callback_data: "payment", text: "Оплата"}]
//         ]
//     })
// }

// const adminButtons = (level) => {
//     const buttons = [
//         [{text: commandsData.get_users}, {text: commandsData.rm_user}],
//         [{text: commandsData.sub_user}, {text: commandsData.rm_sub_user}],
//     ];
//     if(level >= 777) buttons.push([{text: commandsData.set_user_role}, {text: commandsData.get_user_entity}]);
//     buttons.push([{text: commandsData.back}]);
//     return {
//         reply_markup: JSON.stringify({
//             keyboard: buttons
//         })
//     }
// }

// const menuButtons = (levelPermision) => {
//     const buttons = [
//         // {text: commandsData.filters, text: "Фильтры"}
//         [{text: commandsData.keywords}],
//         [{text: commandsData.exceptionWords}],
//         [{text: commandsData.chats}, {text: commandsData.blackList}],
//         [{text: commandsData.payment}, {text: commandsData.support}],
//     ];
//     if(securityButtons[String(levelPermision)]) buttons.push(securityButtons[String(levelPermision)]);
//     return {
//         reply_markup: JSON.stringify({
//             keyboard: buttons
//         })
//     }
// }

const nameMap = {
    "create": "Создать Тест",
    "list": "Список Тестов",
    "start": "Пройти Тест",
    "dev": "Автогенерация вопроса (сумма)",
    "question": "Вопрос",
    "correct_answer": "Правильный ответ",
    "a_answer": "A ответ",
    "b_answer": "B ответ",
    "c_answer": "C ответ",
    "back": "Назад/Отмена",
    "add": "Добавить",
    "finish": "Завершить и сохранить",
    "startTest": "Начать Тест",
    "results": "Результаты",
    "getTestsData": "!gt",
}

const generateQuestion = (data) => {
    const buttons = [data.correct_answer, data.a_answer, data.b_answer, data.c_answer];
    const randomIndex = Math.floor(Math.random() * 3);
    const index = Math.random() > 0.5 ? 3 - randomIndex : randomIndex
    buttons[0] = buttons[index];
    buttons[index] = data.correct_answer;
    const keyboard = [[{text: buttons[0]},{text: buttons[1]}],[{text: buttons[2]},{text: buttons[3]}],[{text: nameMap.back}]];
    return {
        answer: data.correct_answer,
        question: data.question,
        buttons: {
            reply_markup: JSON.stringify({keyboard})
        }
    }
}

const generateStartQuestion = (flag = false) => {
    const a = Math.ceil(Math.random() * 10);
    const b = Math.ceil(Math.random() * 10);
    const c = a + b;
    const randomIndex = Math.floor(Math.random() * 3);
    const buttons = [c];
    while(buttons.length !== 4) {
        const random = Math.ceil(Math.random() * 15)
        if(!buttons.includes(random)) {
            buttons.push(random);
        }
    }
    const index = Math.random() > 0.5 ? 3 - randomIndex : randomIndex
    buttons[0] = buttons[index];
    buttons[index] = c;
    const keyboard = [[{text: buttons[0]},{text: buttons[1]}],[{text: buttons[2]},{text: buttons[3]}]];
    if(flag) keyboard.push([{text: nameMap.back}]);
    return {
        answer: c,
        question: `${flag ? "" : "Чтобы начать пройдите тест"}\nСколько будет ${a} + ${b} = ?`,
        buttons: {
            reply_markup: JSON.stringify({keyboard})
        }
    }
}

const backButton = {
    reply_markup: JSON.stringify({
        keyboard: [
            [{text: nameMap.back}]
        ]
    })
}

const mainButtons = {
    reply_markup: JSON.stringify({
        keyboard: [
            [{text: nameMap.create},{text: nameMap.list}],
            [{text: nameMap.start},{text: nameMap.dev}],
            [{text: nameMap.results}],
        ]
    })
}

const createTestStep = {
    reply_markup: JSON.stringify({
        keyboard: [
            [{text: nameMap.add}],
            [{text: nameMap.finish}]
        ]
    })
}

const testSelectedButtons = {
    reply_markup: JSON.stringify({
        keyboard: [
            [{text: nameMap.startTest}],
            [{text: nameMap.back}]
        ]
    })
}

const createTest = {
    reply_markup: JSON.stringify({
        keyboard: [
            [{text: nameMap.question}],
            [{text: nameMap.correct_answer},{text: nameMap.a_answer}],
            [{text: nameMap.b_answer},{text: nameMap.c_answer}]
        ]
    })
}

const commands = [
    {command: "/start", description: "Начать"},
    {command: "/status", description: "Статус"},
    {command: "/instructions", description: "Инструкция"}
]

const createTestsListButtons = (tests) => ({
    reply_markup: JSON.stringify({
        inline_keyboard: tests.map((t, index) => [{callback_data: `test_${index}`, text: t.name}])
    })
})

module.exports = {
    commands,
    generateStartQuestion,
    mainButtons,
    nameMap,
    createTest,
    createTestStep,
    backButton,
    createTestsListButtons,
    testSelectedButtons,
    generateQuestion,
    // controlButtons,
    // paymentButton,
    // confirmationButtons,
    // menuButtons,
    // adminButtons,
    // commandsData
};

// filters: {
//     text: "«Фильтры»\nТут пока ничего нету.",
//     type: "entity",
//     add: "Добавление. Введите фильтры (один фильтр - одно сообщение)",
//     remove: "Удаление. Введите фильтры (один фильтр - одно сообщение)"
// },