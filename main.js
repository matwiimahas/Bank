let cash = 500;
let cashInput = 0;
let cashOutput = 0;
let InputEnabled = false;
let InputText = [];
let StepId = 0;

function UserCard(id){
    let hasit = false;
    let pin = null;
    let balance = 100;
    let transactionLimit = 100;
    let historyLogs = [];

    function recordOperation(type, amount, date){
        historyLogs.push({
            type,
            amount,
            date
        });
    }

    return {
        getCardOptions: function(){
            return {
                id,
                balance,
                transactionLimit,
                historyLogs,
                hasit
            }
        },
        putCredits(amount) {
            if (amount <= transactionLimit) {
                balance += amount;
                recordOperation('Отримано гроші', amount, new Date().toLocaleString());
            }else {
                console.log('Transaction limit exceeded');
            }
        },
        takeCredits(amount) {
            if (amount <= balance) {
                if (amount <= transactionLimit) {
                    balance -= amount;
                    recordOperation('Забрано гроші', amount, new Date().toLocaleString());
                } else {
                    console.log('Transaction limit exceeded');
                }
            } else {
                console.log('Not enough balance');
            }
        },
        setTransactionLimit(amount) {
            transactionLimit = amount;
            recordOperation('Зміна ліміту', amount, new Date().toLocaleString());
        },
        transferCredits(amount, recipientCard) {
            const tax = amount * 0.005;
            const totalAmount = amount + tax;

            if (totalAmount <= balance) {
                if (totalAmount <= transactionLimit) {
                    balance -= totalAmount;
                    recipientCard.putCredits(amount);
                    recordOperation('Перенесено гроші', amount, new Date().toLocaleString());
                } else {
                    console.log('Transaction limit exceeded');
                }
            } else {
                console.log('Not enough balance');
            }
        },
        setpincode(pincode) {
            pin = pincode;
            recordOperation('Змінено пароль', "secret", new Date().toLocaleString());
        },
        checkpincode(input) {
            return input === pin;
        },
        setHasCard(value) {
            hasit = value;
        },
    }
}

//let userCard1 = new UserCard(1);

//userCard1.putCredits(50);
//userCard1.takeCredits(25);
//console.log(userCard1.getCardOptions());

//userCard1.setTransactionLimit(200);
//userCard1.putCredits(150);
//console.log(userCard1.getCardOptions());

//let userCard2 = new UserCard(2);
//userCard1.transferCredits(50, userCard2);
//console.log(userCard1.getCardOptions());
//console.log(userCard2.getCardOptions());

function ButtonMainData(id) {


    function showactiontext(text, id, size) {
        $(`#button-main-${id}`).show();
        $(`#button-main-${id}`).text(text);
        $(`#button-main-${id}`).css('font-size', size);
    }

    function waitForCash(amount, timeout = 20000) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const check = setInterval(() => {
                if (cashInput >= amount) {
                    clearInterval(check);
                    resolve();
                } else if (Date.now() - start > timeout) {
                    clearInterval(check);
                    reject("Час очікування минув");
                }
            }, 100);
        });
    }

    return {
        actionOnClick: function(title, text, isinput, screenheight, screenwidth, showedbuttons, buttontext, buttonsize, buttonsaction, needswaiting, waitfor, actionwaitid) {
            $('.button-main').hide();
            for (const button of showedbuttons) {
                showactiontext(buttontext[button], button, buttonsize[button]);
            }
            $(`#display-title`).text(title);
            $(`#display-text`).text(text);
            if (isinput) {
                $('.input').show();
            }else{
                $('.input').hide();
            }
            document.getElementsByClassName('display')[0].style.top = screenheight;
            document.getElementsByClassName('display')[0].style.left = screenwidth;

            ShowBtns(buttonsaction);

            InputEnabled = isinput

            if (needswaiting === true) {
                waitForCash(waitfor).then(() => {
                    if (actionwaitid === 1) {
                        ButtonMainData(1).actionOnClick('Час створити пін-код!', 'Введіть пін-код для карти', true, '0%', '0%', [], [], [], []);
                        userCard = new UserCard(1)
                        StepId = 2;
                    }else if (actionwaitid === 2) {
                        if (cashInput > userCard.getCardOptions().transactionLimit) {
                            ButtonMainData(1).actionOnClick('Ліміт перевишчено', `Ви не можете передати ${cashInput} на карту оскільки перевишчує ліміт ${userCard.getCardOptions().transactionLimit}!`, false, '0%', '0%', ["1"], {"1": "Назад"}, {"1": "15px"}, []);
                            userCard.putCredits(cashInput)
                            StepId = 6;
                            cashInput = 0;
                        }else {
                            ButtonMainData(1).actionOnClick('Готово!', `Передано ${cashInput} на карту!`, false, '0%', '0%', ["1"], {"1": "Назад"}, {"1": "15px"}, []);
                            userCard.putCredits(cashInput)
                            StepId = 6;
                            cashInput = 0;
                        }
                    }
                });
            }
        }
    }
}

let userCard = new UserCard(1)

function ShowBtns(btns) {

    $('#insertCard').hide();
    $('#takeCard').hide();
    $('#insertMoney').hide();
    $('#moneyInput').hide();
    $('#takeMoney').hide();

    function showbtn(name) {
        $(`#${name}`).show();
    }

    for (const btn of btns) {
        showbtn(btn);
    }
}

function Bankomat() {
    let card = null;

    return {
        takemoney: function(amount) {
            cashInput += Number(amount);
            console.log(cashInput);
        },
        insertcard: function(card) {
            this.card = card;
        },
        givemoney: function(amount) {
            cashOutput = 0;
        },
        ejectcard: function() {
            this.card = null;
        },
    }
}

function GetHomeStyles() {
    return {
        title: 'Головна',
        text: '',
        isinput: false,
        screenheight: '0%',
        screenwidth: '0%',
        showedbuttons: ["1","2","3", "4", "5", "6"],
        buttontext: { "1": "Перевірити дані карти", "2": "Передати кошти на карту", "3": "Взяти гроші з карти" , "4": "Змінити ліміт", "5": "Більше (СКОРО)", "6": "Закінчити сесію"},
        buttonsize: { "1": "12px", "2": "11px", "3": "12px", "4": "13px", "5": "11px", "6": "12px" },
        buttonsaction: [],
        needswaiting: false,
        waitfor: 0,
        actionwaitid: 0
    }
}

const ctx = new (window.AudioContext || window.webkitAudioContext)();

function beep() {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "square";       // форма хвилі (можна "square" для більш різкого піку)
  osc.frequency.value = 700; // частота в герцах (800 Hz = короткий піп)

  gain.gain.setValueAtTime(0.4, ctx.currentTime); // гучність
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); // плавне затухання

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.4); // тривалість ~0.2 сек
}

$('.button-main').hide();
$('.input').hide();
$('#insertCard').hide();
$('#takeCard').hide();
$('#insertMoney').hide();
$('#moneyInput').hide();
$('#takeMoney').hide();
$('.button').click(function() {
    beep();
})
$('#button-main-1').show();
document.getElementsByClassName('display')[0].style.top = '10%';
$('#button-main-1').text('Купити картку');
$('#button-main-1').css('font-size', '14px');

ShowBtns(['insertCard']);

$('#insertCard').click(function() {
    if (userCard.getCardOptions().hasit === true) {
        StepId = 4;
        ButtonMainData(1).actionOnClick('Введіть пін-код', '', true, '0%', '0%', [], [], [], [], false, 0, 0);
    } else {
        alert("Ви не маєте картку. Будь ласка, купіть картку.");
    }
})

setInterval(() => {
    $('#balance').text('Cash: ' + cash);
}, 500);

$('#button-top-left').click(function() {
    if (StepId === 0) {
        if (userCard.getCardOptions().hasit === false) {
            ButtonMainData(1).actionOnClick('Вітаємо у банкоматі!', 'Будь ласка, вставте гроші щоб купити картку, а після цього ви зможете додати пін-код. (Карта коштує 100 грн)', false, '0%', '0%', [], [], [], ['insertMoney', 'moneyInput'], true, 100, 1);
            StepId = 1;
        }else{
            alert("Ви уже маєте карту, підтримки кількох карт недоступно")
        }
    }else{
        if (StepId === 5) {
            const logs = userCard.getCardOptions().historyLogs
                .map(log => `${log.type}: ${log.amount} (${log.date})`)
                .join("\n");

            ButtonMainData(1).actionOnClick(
                'Перевірка коштів',
                `Баланс: ${userCard.getCardOptions().balance}, Ліміт: ${userCard.getCardOptions().transactionLimit}\nІсторія:\n${logs}`,
                false,
                '0%',
                '0%',
                ["1"],
                {"1": "Назад"},
                {"1": "14px"},
                [],
                false,
                0,
                0
            );
            StepId = 6;
        }else{
        if (StepId === 6 || StepId === 7) {
            let styles = GetHomeStyles();
            ButtonMainData(1).actionOnClick(
                styles.title,
                styles.text,
                styles.isinput,
                styles.screenheight,
                styles.screenwidth,
                styles.showedbuttons,
                styles.buttontext,
                styles.buttonsize,
                styles.buttonsaction,
                styles.needswaiting,
                styles.waitfor,
                styles.actionwaitid
            );
            StepId = 5;
        }
    }
    }
})

$('#button-center-left').click(function() {
    if (StepId === 5) {
        ButtonMainData(1).actionOnClick('Передавання коштів', `Ми зараз чекаємо поки ви передаште одну кількість коштів`, false, '0%', '0%', ["1"], {"1": "Скасувати"}, {"1": "14px"}, ["insertMoney", "moneyInput"], true, 10, 2);
        StepId = 6;
    }
})

$('#button-bottom-left').click(function() {
    if (StepId === 5) {
        ButtonMainData(1).actionOnClick('Втягання коштів', `Напишіть суму і ми їх дамо`, true, '0%', '0%', ["1"], {"1": "Скасувати"}, {"1": "14px"}, [], false, 0, 0);
        StepId = 6;
    }
})

$('#button-top-right').click(function() {
    if (StepId === 5) {
        ButtonMainData(1).actionOnClick('Заміна ліміту', `Напишіть суму і ми зиінимо ліміт`, true, '0%', '0%', ["1"], {"1": "Скасувати"}, {"1": "14px"}, [], false, 0, 0);
        StepId = 7;
    }
})

$('#button-bottom-right').click(function() {
    if (StepId === 5) {
        ButtonMainData(1).actionOnClick('Чекаємо на карту...', `Ви запхайте карту щоб продовжити, якщо ви не маєте картки, натисніть на кнопку`, false, '10%', '0%', ["1"], {"1": "Купити картку"}, {"1": "14px"}, ["insertCard"], false, 0, 0);
        StepId = 0;
    }else{
        console.log(StepId)
    }
})

$('#insertMoney').click(function() {
    if (cash >= document.getElementById('moneyInput').value) {
        cash -= document.getElementById('moneyInput').value;
        let amount = Number(document.getElementById('moneyInput').value);
        Bankomat().takemoney(Number(document.getElementById('moneyInput').value));
        $('#balance').text('Cash: ' + cash);
    } else {
        alert("Недостатньо коштів.");
    }
})

$('#takeCard').click(function() {
    userCard.setHasCard(true);
    Bankomat().ejectcard()
    ShowBtns(['insertCard']);
    ButtonMainData(1).actionOnClick('Чекаємо на карту', 'Ви запхайте карту щоб продовжити', false, '0%', '0%', [], [], [], ['insertCard'], false, 0, 0);
})

$('#takeMoney').click(function() {
    cash += cashOutput
    Bankomat().givemoney(cashOutput);
    $('#balance').text('Cash: ' + cash);
    if (StepId == 6) {
        let styles = GetHomeStyles();
        ButtonMainData(1).actionOnClick(
            styles.title,
            styles.text,
            styles.isinput,
            styles.screenheight,
            styles.screenwidth,
            styles.showedbuttons,
            styles.buttontext,
            styles.buttonsize,
            styles.buttonsaction,
            styles.needswaiting,
            styles.waitfor,
            styles.actionwaitid
        );
        StepId = 5;
    }
})

$(`#1`).click(function () {
    if (InputEnabled === true) {
        InputText += "1"
        $('#input').text(InputText)
    }
})
$(`#2`).click(function () {
    if (InputEnabled === true) {
        InputText += "2"
        $('#input').text(InputText)
    }
})
$(`#3`).click(function () {
    if (InputEnabled === true) {
        InputText += "3"
        $('#input').text(InputText)
    }
})
$(`#4`).click(function () {
    if (InputEnabled === true) {
        InputText += "4"
        $('#input').text(InputText)
    }
})
$(`#5`).click(function () {
    if (InputEnabled === true) {
        InputText += "5"
        $('#input').text(InputText)
    }
})
$(`#6`).click(function () {
    if (InputEnabled === true) {
        InputText += "6"
        $('#input').text(InputText)
    }
})
$(`#7`).click(function () {
    if (InputEnabled === true) {
        InputText += "7"
        $('#input').text(InputText)
    }
})
$(`#8`).click(function () {
    if (InputEnabled === true) {
        InputText += "8"
        $('#input').text(InputText)
    }
})
$(`#9`).click(function () {
    if (InputEnabled === true) {
        InputText += "9"
        $('#input').text(InputText)
    }
})
$(`#0`).click(function () {
    if (InputEnabled === true) {
        InputText += "0"
        $('#input').text(InputText)
    }
})
$(`#clear`).click(function () {
    if (InputEnabled === true) {
        InputText = "";
        $('#input').text('')
    }
})
$(`#submit`).click(function () {
    if (InputEnabled === true) {
        $('#input').text('')
        if (StepId === 2) {
            cashInput = 0;
            StepId = 3;
            userCard.setpincode(Number(InputText))
            InputText = "";
            ButtonMainData(1).actionOnClick('Ваша кврта готова до використання!', 'Будь ласка, ми зараз видамо вам створену карту', false, '0%', '0%', [], [], [], ['takeCard'], false, 0, 0);
        }else{
            if (StepId === 4) {
                let correct = userCard.checkpincode(Number(InputText))
                if (correct === true) {
                    StepId = 5;
                    InputText = "";
                    let styles = GetHomeStyles();
                    ButtonMainData(1).actionOnClick(
                        styles.title,
                        styles.text,
                        styles.isinput,
                        styles.screenheight,
                        styles.screenwidth,
                        styles.showedbuttons,
                        styles.buttontext,
                        styles.buttonsize,
                        styles.buttonsaction,
                        styles.needswaiting,
                        styles.waitfor,
                        styles.actionwaitid
                    );
                }else{
                    alert("Wrong pin!")
                    InputText = "";
                }
            }else if (StepId === 6) {
                if (InputText > userCard.getCardOptions().balance) {
                    alert("Not enouch money on card")
                    InputText = "";
                }else{
                    cashOutput = Number(InputText);
                    InputText = "";
                    userCard.takeCredits(cashOutput)
                    ButtonMainData(1).actionOnClick(
                        'Успішно',
                        'Заберіть свої гроші',
                        false,
                        '0%',
                        '0%',
                        [],
                        {},
                        {},
                        ["takeMoney"],
                        false,
                        0,
                        0
                    );
                }
            }else if (StepId === 7) {
                userCard.setTransactionLimit(InputText)
                InputText = "";
                ButtonMainData(1).actionOnClick(
                    'Успішно',
                    'Можна повертатися на головну',
                    false,
                    '0%',
                    '0%',
                    ["1"],
                    {"1": "На головну"},
                    {"1": "14px"},
                    [],
                    false,
                    0,
                    0
                );
            }
        }
    }else{
        console.warn('Input is off')
    }
})