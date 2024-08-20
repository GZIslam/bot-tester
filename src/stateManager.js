const { generateStartQuestion, mainButtons, nameMap, createTestStep, createTestsListButtons, testSelectedButtons, generateQuestion, backButton, createTest } = require("./interface");

const stateManager = (bot) => {
    const chats = {};
    const onCallbackQuery = async (msg) => {
        // console.log(msg)
        const data = msg.data;
        const chatId = msg.message.chat.id;
        const route = data.split("_");
        if(!chats[chatId]) return
        if(route[0] === "test") {
            if(!chats[chatId].tests) {
                await bot.sendMessage(chatId, "Ошибка");
            } else {
                await bot.sendMessage(chatId, `Вы выбрали - ${chats[chatId].tests[Number(route[1])].name}`, {parse_mode : "HTML", ...testSelectedButtons});
                chats[chatId].currentTest = chats[chatId].tests[Number(route[1])];
            }
        }
    }
    const onMessage = async (msg) => {
        // console.log(msg)
        const text = msg.text;
        const chatId = msg.chat.id;
        const user = chats[chatId];
        const {question, buttons, answer} = generateStartQuestion();
        if(!user) {
            await bot.sendMessage(chatId, question, {parse_mode : "HTML", ...buttons});
            chats[chatId] = {question, buttons, answer, authorized: false}
        } else {
            if(!user.authorized) {
                if(text != user.answer) {
                    await bot.sendMessage(chatId, user.question, {parse_mode : "HTML", ...user.buttons});
                }
                if(user.answer == text) {
                    await bot.sendMessage(chatId, "Правильно!\nВы вошли.", {parse_mode : "HTML", ...mainButtons});
                    chats[chatId] = {authorized: true, status: "home"};
                }
            } else {
                switch (text) {
                    case nameMap.create:
                        await bot.sendMessage(chatId, "Напишите название Теста");
                        user.status = "create";
                        user.step = "name";
                        break;
                    case nameMap.list:
                        if(!user.tests) {
                            await bot.sendMessage(chatId, "У вас пока нету тестов", {parse_mode : "HTML", ...mainButtons});
                        } else {
                            await bot.sendMessage(chatId, "Список всех ваших тестов:\n" + user.tests.map((t, index) => `${index + 1}. ${t.name}`).join("\n"), {parse_mode : "HTML", ...mainButtons});
                        }
                        break;
                    case nameMap.start:
                        if(!user.tests) {
                            await bot.sendMessage(chatId, "У вас пока нету тестов", {parse_mode : "HTML", ...mainButtons});
                        } else {
                            await bot.sendMessage(chatId, "Выберите тест:", {parse_mode : "HTML", ...createTestsListButtons(user.tests)});
                        }
                        break;
                    case nameMap.dev:
                        const {question, buttons, answer} = generateStartQuestion(true);
                        await bot.sendMessage(chatId, "Автогенерация (сумма)\n" + question, {parse_mode : "HTML", ...buttons});
                        chats[chatId] = {question, buttons, answer, ...chats[chatId], status: "dev"};
                        break;
                    case nameMap.back:
                        // if(!!chats[chatId].score) {
                        //     await bot.sendMessage(chatId, "ОЧКИ: " + chats[chatId].score);
                        // }
                        await bot.sendMessage(chatId, "Главное меню.", {parse_mode : "HTML", ...mainButtons});
                        delete chats[chatId].score
                        chats[chatId].status = "home";
                        break;
                    case nameMap.startTest:
                        chats[chatId].currentIndex = 0;
                        const data = generateQuestion(chats[chatId].currentTest.questions[0]);
                        await bot.sendMessage(chatId, data.question, {parse_mode : "HTML", ...data.buttons});
                        chats[chatId].currentTest.res = data;
                        chats[chatId].status = "test";
                        break;
                    default:
                        switch (user.status) {
                            case "create":
                                switch (user.step) {
                                    case "name":
                                        user.test = {name: text, current: {}, questions: []};
                                        await bot.sendMessage(chatId, `Название: ${user.test.name}\nТеперь напишите вопрос:`)//, {parse_mode : "HTML", ...backButton});
                                        user.step = "question";
                                        break;
                                    case "question":
                                        user.test.current.question = text;
                                        await bot.sendMessage(chatId, `Вопрос: ${user.test.current.question}\nТеперь напишите ПРАВИЛЬНЫЙ ответ:`)//, {parse_mode : "HTML", ...backButton});
                                        user.step = "correct_answer";
                                        break;
                                    case "correct_answer":
                                        user.test.current.correct_answer = text;
                                        await bot.sendMessage(chatId, `Правильный ответ: ${user.test.current.correct_answer}\nТеперь напишите "A" ответ:`)//, {parse_mode : "HTML", ...backButton});
                                        user.step = "a_answer";
                                        break;
                                    case "a_answer":
                                        user.test.current.a_answer = text;
                                        await bot.sendMessage(chatId,  `A ответ: ${user.test.current.a_answer}\nТеперь напишите "B" ответ:`)//, {parse_mode : "HTML", ...backButton});
                                        user.step = "b_answer";
                                        break;
                                    case "b_answer":
                                        user.test.current.b_answer = text;
                                        await bot.sendMessage(chatId, `B ответ: ${user.test.current.b_answer}\nТеперь напишите "C" ответ:`)//, {parse_mode : "HTML", ...backButton});
                                        user.step = "c_answer";
                                        break;
                                    case "c_answer":
                                        user.test.current.c_answer = text;
                                        await bot.sendMessage(chatId, `C ответ: ${user.test.current.c_answer}\nТеперь вы можете добавить вопрос или завершить создание теста.`, {parse_mode : "HTML", ...createTestStep});
                                        user.step = "next_action";
                                        break;
                                    case "next_action":
                                        if(text === nameMap.add) {
                                            user.test.questions.push(JSON.parse(JSON.stringify(user.test.current)));
                                            user.step = "question";
                                            await bot.sendMessage(chatId, `Напишите вопрос:`)//, {parse_mode : "HTML", ...backButton});
                                        } else if (text === nameMap.finish) {
                                            user.test.questions.push(user.test.current);
                                            if(user.tests){
                                                user.tests.push({name: user.test.name, questions: user.test.questions});
                                            } else {
                                                user.tests = [{name: user.test.name, questions: user.test.questions}];
                                            }
                                            await bot.sendMessage(chatId, `Тест ${user.test.name} добавлен в список`, {parse_mode : "HTML", ...mainButtons});
                                            user.status = "home";
                                        }
                                        break;
                                }
                                break;
                            case "dev":
                                if(text == chats[chatId].answer) {
                                    if(chats[chatId].score !== undefined) {
                                        chats[chatId].score += 1;
                                    } else {
                                        chats[chatId].score = 1;
                                    }
                                    const {question, buttons, answer} = generateStartQuestion(true);
                                    await bot.sendMessage(chatId, "Правильно!\nОЧКИ: " + chats[chatId].score + "\n" + question, {parse_mode : "HTML", ...buttons});
                                    chats[chatId] = {...chats[chatId], question, buttons, answer}
                                } else {
                                    if(chats[chatId].score !== undefined) {
                                        chats[chatId].score -= 1;
                                    } else {
                                        chats[chatId].score = 0;
                                    }
                                    await bot.sendMessage(chatId, "Неправильно!\nОЧКИ: " + chats[chatId].score + "\n" + chats[chatId].question, {parse_mode : "HTML", ...chats[chatId].buttons});
                                }
                                break;
                            case "test":
                                if(text == chats[chatId].currentTest.res.answer) {
                                    if(chats[chatId].score !== undefined) {
                                        chats[chatId].score += 1;
                                    } else {
                                        chats[chatId].score = 1;
                                    }
                                    
                                    if(chats[chatId].currentIndex < chats[chatId].currentTest.questions.length - 1) {
                                        chats[chatId].currentIndex = chats[chatId].currentIndex + 1;
                                        const data = generateQuestion(chats[chatId].currentTest.questions[chats[chatId].currentIndex]);
                                        await bot.sendMessage(chatId, "Правильно\nОЧКИ: " + chats[chatId].score + "\n" + data.question, {parse_mode : "HTML", ...data.buttons});
                                        chats[chatId].currentTest.res = data;
                                    } else {
                                        await bot.sendMessage(chatId, "Правильно!\nТест завершен!\nОЧКИ: " + chats[chatId].score, {parse_mode : "HTML", ...mainButtons});
                                        chats[chatId].status = "home";   
                                    }
                                } else {
                                    if(chats[chatId].score !== undefined) {
                                        chats[chatId].score -= 1;
                                    } else {
                                        chats[chatId].score = 0;
                                    }
                                    await bot.sendMessage(chatId, "Неправильно!\nОЧКИ: " + chats[chatId].score + "\n" + chats[chatId].currentTest.res.question, {parse_mode : "HTML", ...chats[chatId].currentTest.res.buttons});
                                }
                                break;
                            default:
                                await bot.sendMessage(chatId, "Выбери комманду!", {parse_mode : "HTML", ...mainButtons});
                                break;
                        }
                        break;
                }
            }
        }
    };

    return {
        onMessage,
        onCallbackQuery
    }
}

module.exports = stateManager