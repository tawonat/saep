const { Builder, By, Key, until } = require('selenium-webdriver');

async function testeSaepV2() {
    // Inicializa o navegador
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // =================================================================
        // 1. CONFIGURAÇÃO INICIAL
        // =================================================================
        // IMPORTANTE: Troque pelo caminho do seu arquivo novo
        await driver.get('http://127.0.0.1:5500/saep/index.html'); 
        console.log(">> 🚀 Iniciando testes do SAEP Digital...");

        // =================================================================
        // 2. TELA DE LOGIN
        // =================================================================
        // Espera e preenche o Nome (placeholder mudou para "Seu nome")
        await driver.wait(until.elementLocated(By.css("input[placeholder='Seu nome']")), 5000);
        await driver.findElement(By.css("input[placeholder='Seu nome']")).sendKeys("Tester Automatizado");
        
        // Preenche Escola e CPF
        await driver.findElement(By.css("input[placeholder='Senai Shunji Nishimura']")).sendKeys("Escola Tech");
        await driver.findElement(By.css("input[placeholder='000.000.000-00']")).sendKeys("999.888.777-66");

        // Clica no botão ACESSAR SISTEMA
        // Dica: Usamos xpath para garantir que clicamos no botão certo pelo texto
        const btnLogin = await driver.findElement(By.xpath("//button[contains(text(), 'ACESSAR SISTEMA')]"));
        await btnLogin.click();
        console.log(">> ✅ Login realizado.");

        // =================================================================
        // 3. SELEÇÃO DE ANO
        // =================================================================
        await driver.wait(until.elementLocated(By.css(".card-year")), 5000);
        
        // Vamos clicar no ano 2024 (que tem a bolinha verde 'new' no seu CSS)
        // O Xpath abaixo procura um .card-year que tenha o texto "2024" dentro
        let anoAlvo = await driver.findElement(By.xpath("//div[contains(@class, 'card-year') and .//span[contains(text(), '2024')]]"));
        await anoAlvo.click();
        console.log(">> ✅ Ano 2024 selecionado.");

        // =================================================================
        // 4. LISTA DE PROVAS
        // =================================================================
        await driver.wait(until.elementLocated(By.className("card-exam")), 5000);
        
        // Clica na Prova 03 (índice 2 do array)
        let provas = await driver.findElements(By.className("card-exam"));
        await provas[2].click(); 
        console.log(">> ✅ Prova 03 iniciada.");

        // =================================================================
        // 5. RESPONDENDO QUESTÕES (Loop Inteligente)
        // =================================================================
        await driver.wait(until.elementLocated(By.id("screen-taking-exam")), 5000);

        // Vamos responder 6 questões (para passar pela questão 5 que tem imagem)
        const QTD_PARA_RESPONDER = 40; 

        for (let i = 0; i < QTD_PARA_RESPONDER; i++) {
            // Espera as opções carregarem
            await driver.wait(until.elementLocated(By.className("option-item")), 5000);
            
            // --- VERIFICAÇÃO DE IMAGEM (NOVO) ---
            // Verifica se a imagem está visível (sem a classe hidden-img)
            let imgElement = await driver.findElement(By.id("q-imagem-preview"));
            let classeImagem = await imgElement.getAttribute("class");
            
            if (!classeImagem.includes("hidden-img")) {
                let src = await imgElement.getAttribute("src");
                console.log(`   [INFO] Imagem detectada na Questão ${i+1}: ${src.substring(0, 30)}...`);
            }
            // ------------------------------------

            // Seleciona uma opção aleatória
            let opcoes = await driver.findElements(By.className("option-item"));
            let randomOpt = Math.floor(Math.random() * opcoes.length);
            await opcoes[randomOpt].click();
            
            console.log(`>> Questão ${i + 1} respondida.`);

            // Clica em próxima (se não for a última interação)
            if (i < QTD_PARA_RESPONDER - 1) {
                await driver.findElement(By.id("btn-next")).click();
                await driver.sleep(500); // Pausa visual
            }
        }

        // =================================================================
        // 6. FINALIZAR PROVA
        // =================================================================
        console.log(">> Tentando finalizar...");
        
        let btnFinish = await driver.findElement(By.className("btn-finish"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", btnFinish);
        await driver.sleep(500);
        await btnFinish.click();

        // Lida com o CONFIRM do navegador ("Você respondeu apenas X questões...")
        await driver.wait(until.alertIsPresent(), 5000);
        await driver.switchTo().alert().accept();
        
        console.log(">> Alert aceito.");

        // =================================================================
        // 7. VERIFICAÇÃO DE RESULTADOS (NOVO)
        // =================================================================
        // Agora esperamos a tela de resultado aparecer (não é mais reload)
        await driver.wait(until.elementIsVisible(driver.findElement(By.id("screen-result"))), 5000);
        
        // Verifica se o gráfico foi criado (canvas)
        let canvasGrafico = await driver.findElement(By.id("graficoResultado"));
        if(await canvasGrafico.isDisplayed()) {
            console.log(">> ✅ Gráfico de desempenho gerado com sucesso.");
        }

        // Captura o texto de acertos
        let txtAcertos = await driver.findElement(By.id("txt-acertos")).getText();
        console.log(`>> 📊 RESULTADO FINAL: Você acertou ${txtAcertos} questões.`);

        await driver.sleep(5000); // Tempo para admirar o gráfico

    } catch (erro) {
        console.error("❌ ERRO NO TESTE:", erro);
    } finally {
        await driver.quit();
    }
}

testeSaepV2();