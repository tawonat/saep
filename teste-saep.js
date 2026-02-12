const { Builder, By, Key, until } = require('selenium-webdriver');

async function testeCompletoApp() {
    // Inicializa o navegador
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // =================================================================
        // 1. ACESSAR A URL (Ajuste para o caminho do seu arquivo)
        // =================================================================
        // Exemplo local: 'file:///C:/Users/SeuNome/Desktop/projeto/index.html'
        // Exemplo servidor: 'http://127.0.0.1:5500/index.html'
        await driver.get('http://127.0.0.1:5500/saep/index.html'); 
        
        console.log(">> Site carregado.");

        // =================================================================
        // 2. TELA DE LOGIN
        // =================================================================
        // Como não tem ID, usamos CSS Selector pelo placeholder
        await driver.wait(until.elementLocated(By.css("input[placeholder='Nome']")), 5000);
        
        await driver.findElement(By.css("input[placeholder='Nome']")).sendKeys("Robô Selenium");
        await driver.findElement(By.css("input[placeholder='Ex: Senai Shunji Nishimura']")).sendKeys("Escola Teste");
        await driver.findElement(By.css("input[placeholder='000.000.000-00']")).sendKeys("123.123.123-99");
        
        // Clica no botão de acessar
        await driver.findElement(By.css(".btn-primary")).click();
        console.log(">> Login realizado.");

        // =================================================================
        // 3. SELEÇÃO DE ANO
        // =================================================================
        // Espera os cards de ano (.card-year) serem criados pelo JS
        await driver.wait(until.elementLocated(By.css(".card-year")), 5000);
        
        // Pega todos os anos e clica no primeiro (índice 0) ou no segundo (índice 1)
        let anos = await driver.findElements(By.className("card-year"));
        if (anos.length > 0) {
            await anos[0].click(); // Clica no mais recente (2025)
            console.log(">> Ano selecionado.");
        }

        // =================================================================
        // 4. LISTA DE PROVAS
        // =================================================================
        // Espera a lista de provas aparecer
        await driver.wait(until.elementLocated(By.className("card-exam")), 5000);
        
        // Clica na primeira prova da lista
        let provas = await driver.findElements(By.className("card-exam"));
        await provas[0].click();
        console.log(">> Prova iniciada.");

        // =================================================================
        // 5. RESPONDENDO QUESTÕES (Loop)
        // =================================================================
        // Vamos responder 5 questões para testar
        const QTD_PARA_RESPONDER = 40; 

        // Espera a tela da prova carregar
        await driver.wait(until.elementLocated(By.id("screen-taking-exam")), 5000);

        for (let i = 0; i < QTD_PARA_RESPONDER; i++) {
            // Espera as opções (.option-item) aparecerem na tela
            // O wait aqui é crucial porque o DOM é recriado a cada "Próxima"
            await driver.wait(until.elementLocated(By.className("option-item")), 5000);
            
            // Pega as 5 opções (A, B, C, D, E)
            let opcoes = await driver.findElements(By.className("option-item"));
            
            // Escolhe uma aleatória entre 0 e 4
            let randomOpt = Math.floor(Math.random() * opcoes.length);
            await opcoes[randomOpt].click();
            
            console.log(`>> Questão ${i + 1} respondida (Opção índice ${randomOpt})`);

            // Se não for a última interação do loop, clica em Próxima
            if (i < QTD_PARA_RESPONDER - 1) {
                await driver.findElement(By.id("btn-next")).click();
                await driver.sleep(500); // Pequena pausa para transição visual
            }
        }

        // =================================================================
        // 6. FINALIZAR PROVA (Tratando window.confirm e window.alert)
        // =================================================================
        console.log(">> Clicando em Finalizar...");
        
        // Clica no botão Enviar
        let btnFinish = await driver.findElement(By.className("btn-finish"));
        // Scroll para garantir que o botão está visível
        await driver.executeScript("arguments[0].scrollIntoView(true);", btnFinish);
        await driver.sleep(500);
        await btnFinish.click();

        // --- TRATAMENTO DO CONFIRM ---
        // O seu código tem um confirm() ("Deseja realmente finalizar?").
        // O Selenium precisa trocar o foco para o alerta.
        await driver.wait(until.alertIsPresent(), 5000);
        let alertaConfirmacao = await driver.switchTo().alert();
        console.log(">> Texto do Confirm: " + await alertaConfirmacao.getText());
        await alertaConfirmacao.accept(); // Clica em "OK"

        // --- TRATAMENTO DO ALERT DE SUCESSO ---
        // Depois do confirm, seu código lança um alert("Prova enviada...").
        // Precisamos aceitar esse também.
        await driver.wait(until.alertIsPresent(), 5000);
        let alertaSucesso = await driver.switchTo().alert();
        console.log(">> Texto do Alert final: " + await alertaSucesso.getText());
        await alertaSucesso.accept(); // Clica em "OK"

        console.log(">> TESTE CONCLUÍDO COM SUCESSO! ✅");
        
        // Pausa para você ver o resultado antes de fechar
        await driver.sleep(3000);

    } catch (erro) {
        console.error("❌ Erro durante o teste:", erro);
    } finally {
        await driver.quit();
    }
}

testeCompletoApp();