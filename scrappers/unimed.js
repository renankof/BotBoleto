const puppeteer = require('puppeteer');

const chromeOptions = {
  headless:true,
  defaultViewport: null};

async function init(path, spinner) {
  
  const browser = await puppeteer.launch(chromeOptions);
  const page = await browser.newPage();

  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow', downloadPath: path});

  spinner.text = 'Acessando site da Unimed'
  await page.goto(process.env.UNIMED_URL);
  await page.type('input[title=Login]', process.env.UNIMED_LOGIN)
  await page.type('input[title=Senha]', process.env.UNIMED_SENHA)
  await page.click('input[value=Entrar]')
  await page.waitForNavigation()
  await page.goto(`https://www.unimedcuritiba.com.br/wps/myportal/internet/perfil/ja-sou-cliente/pf/servicos-online/solicitar-2-via-de-boleto`)
  
  spinner.text = 'Emitindo segunda via'
  await page.waitFor(6000)
  const frames = await page.frames();
  let frame = frames.find(f => f.name() === "aplicacoes")

  spinner.text = 'Localizando o boleto'
  let link = await getAttributeOf('#ctl00_ContentPlaceHolder1_gvCompetencias > tbody > tr:nth-child(4) > td:nth-child(5) > a','href',frame)

  link = `https://portaluniben.unimedcuritiba.com.br/EmissaoBoleto/${link}`

  try {
    await page.goto(link)
  } catch(e) {
    await page.waitFor(3000)
    browser.close()
    return spinner;
  }

}

async function getAttributeOf(selector, attr, page) {
  return page.$eval(selector, (el, attribute) => el.getAttribute(attribute), attr);
}

module.exports = init