import { ActionIcon, Autocomplete, Button, Card, Center, Flex, Image, Loader, MantineProvider, Stack, Text, Title } from '@mantine/core'
import './App.css'
import '@mantine/core/styles.css'
import wiki from 'wikipedia'
import { useState } from 'react';
import { BiArrowBack, BiQuestionMark, BiShare } from 'react-icons/bi';
import { BsInfo, BsQrCode } from 'react-icons/bs';
import { FaMarkdown } from 'react-icons/fa';
import TurndownService from 'turndown';
import ReactDOM from 'react-dom';
import QRCode from 'qrcode'
import { CgClose, CgColorBucket, CgColorPicker } from 'react-icons/cg';
import { IoColorPalette } from 'react-icons/io5';

function App() {
  const [loading, setLoading] = useState(false);
  let cur = document.body.style.backgroundColor;


  let crimes = [
    'Murder of James Bulger',
    'Murder of Sarah Payne',
    'Murder of Sarah Everard',
    'Murder of Stephen Lawrence',
    'Murder of Rachel Nickell',
    'Clare\'s Law',
    'White House Farm murders',
    'Sally Clark',
    'Colin Pitchfork',
    'Peter Sutcliffe',
    'Murder of Leanne Tiernan',
    'Killing of Damilola Taylor',
  ]

  let reasons = [
    'Links to how surveillance can be used as evidence',
    'Links into campaigns for change',
    'Links to the conduct of the police',
    'Links to the conduct of the police',
    'Links to criminal profiling and the court of appeals',
    'Links into campaigns for change',
    'Links to handling of evidence',
    'Links to expert witnesses',
    'Links to DNA evidence',
    'Links to criminal profiling',
    'Links to DNA evidence and criminal profiling',
    'Links to DNA evidence',
  ]

  let questions = [
    [
      'How old were the 2 boys who murdered James Bulger?',
      'What was the name of Bulger\'s mother?',
      'What key piece of evidence did the police have?'
    ],
    [
      'What was the name of Sarah\'s killer?',
      'How old was Sarah?',
      'What was the name of the victim?'
    ]
  ]

  // sort the crimes alphabetically
  crimes.sort();

  async function search(value: string): Promise<void> {
    if (!value) {
      alert('Please enter a search term');
      return;
    }
    if (!crimes.includes(value)) {
      alert('This crime is not in the list, soz.');
      return;
    }
    setLoading(true);
    console.log(value)
    const reason = reasons[crimes.indexOf(value)]
    const results = await wiki.html(value);
    const title = value
    const text = results
    console.log(results)
    document.getElementById('results-title')!.innerHTML = title;
    document.getElementById('results-reason')!.innerHTML = reason;
    document.getElementById('results-text')!.innerHTML = text.split('"See_also">See also')[0];

    document.getElementById('search-page')!.style.opacity = '0';
    document.getElementById('results')!.style.opacity = '1';
    document.getElementById('results')!.style.height = '100vh';

    try { document.getElementById('results-text')!.getElementsByTagName('table')[0].remove(); } catch (e) { }
    for (const element of (document.querySelectorAll('[role="note"]') as NodeListOf<HTMLElement>)) {
      try { element.remove(); } catch (e) { continue; }
    }
    for (const element of [...document.querySelectorAll('.toc'), ...document.querySelectorAll('[role="navigation"]'), ...document.querySelectorAll('.mw-editsection'), ...document.querySelectorAll('.sidebar'), ...document.querySelectorAll('.ambox'), ...document.querySelectorAll('.reference'), ...document.querySelectorAll('.wikitable'), ...document.querySelectorAll('.reflist')] as HTMLElement[]) {
      try { element.remove(); } catch (e) { continue; }
    }
    for (const element of [...document.querySelectorAll('a')] as unknown as HTMLLinkElement[]) {
      try { element.href = ''; } catch (e) { continue; }
    }
    document.getElementById('toc')!.remove();
    document.getElementById('References')!.remove();

    document.getElementById('search-page')!.style.display = 'none';
  }

  function col(plus = true) {
    let bgcols = ['#faf8f0', '#efe4b6'];
    let idx = bgcols.indexOf(cur);
    if (plus) idx = (idx + 1);;
    console.log(idx);
    if (idx < 0) idx = 0;
    if (idx > bgcols.length - 1) idx = 0;
    document.body.style.backgroundColor = bgcols[idx];
    cur = bgcols[idx];
    const colbutt = document.getElementById('colours')
    console.log(idx);
    if (colbutt) {
      if (idx == 0) {
        console.log(bgcols[1]);
        colbutt.style.background = bgcols[1];
      }
      else {
        console.log(bgcols[0]);
        colbutt.style.background = bgcols[0];
      }

    }
    localStorage.setItem('colour', cur);
  }

  function loaded() {
    // Search the /?s= property if it exists
    const searchst = new URLSearchParams(window.location.search).get('s');
    if (searchst) {
      const loaderContainer = document.createElement('div');
      loaderContainer.style.position = 'fixed';
      loaderContainer.style.top = '50%';
      loaderContainer.style.left = '50%';
      loaderContainer.style.transform = 'translate(-50%, -50%)';
      document.getElementById('search-page')!.innerHTML = "";
      document.getElementById('search-page')?.appendChild(loaderContainer);
      ReactDOM.render(<MantineProvider><Loader type='dots' color='#000' /></MantineProvider>, loaderContainer);
      search(searchst);
    }

    // Load colour from local storage
    cur = localStorage.getItem('colour') || '#faf8f0';
    if (localStorage.getItem('colour')) col(false);

    window.addEventListener('scroll', () => {
      if (window.scrollY === 0) {
        document.getElementById('back-button')!.style.opacity = '0';
      } else {
        document.getElementById('back-button')!.style.opacity = '1';
      }
    });
  }

  function exportMarkdown() {
    const title = document.getElementById('results-title')!.innerText;
    const text = document.getElementById('results-text')!.innerHTML.replace(/<style.*?\/style>/g, '');
    const md = new TurndownService().turndown(text)
    const markdownContent = `# ${title}\n\n${md}`;
    const blob = new Blob([markdownContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  return (
    <MantineProvider>
      <Center style={{ height: '100vh', transition: 'all 0.5s ease-in-out' }} id='search-page'>
        <Stack style={{ width: '30em' }}>
          <ActionIcon id='back-button-c' style={{ opacity: '0', position: 'fixed', width: '3em', height: '3em', top: '1.2em', left: '1.2em', color: 'black', border: '2px solid #ffffffdd', backgroundColor: '#ffffffaa', backdropFilter: 'blur(0.2em)', transition: 'all 0.25s ease-in-out', borderRadius: '50%' }} onClick={() => window.location.href = window.location.origin}>
            <CgClose style={{ width: '2em', height: '2em' }} />
          </ActionIcon>
          <ActionIcon id='colours' style={{ position: 'fixed', width: '3em', height: '3em', top: '1.2em', right: '1.2em', color: 'black', transition: 'all 0.25s ease-in-out', borderRadius: '50%', background: '#fff', backgroundSize: '200% 200%', border: 'none', backdropFilter: 'blur(0.2em)' }} onClick={() => { col(true) }}>
            <IoColorPalette style={{ width: '1.6em', height: '2em' }} />
          </ActionIcon>
          <ActionIcon id='info' style={{ position: 'fixed', width: '3em', height: '3em', top: '1.2em', right: '5em', color: 'black', transition: 'all 0.25s ease-in-out', borderRadius: '50%', background: '#ffffff88', backgroundSize: '200% 200%', border: '2px solid #ffffffdd', backdropFilter: 'blur(0.2em)' }} onClick={() => {
            if (document.getElementById('infoc')) {
              document.getElementById('infoc')?.remove();
              document.getElementById('back-button-c')!.style.opacity = '0';
              return
            }
            const info = <MantineProvider><Center id="infoc"><Card style={{ width: '30em', height: '20em', background: 'white', borderRadius: '1em', padding: '1em', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000 }}>
              <Text style={{ textAlign: 'center' }}>I made this app to help with my Criminology A-Level, it contains case studies that I can use in my classes. It's not perfect, but it's better than nothing.</Text>
            </Card></Center></MantineProvider>
            const infoContainer = document.createElement('div');
            document.body.appendChild(infoContainer);
            ReactDOM.render(info, infoContainer);

            document.getElementById('back-button-c')!.style.opacity = '1';
          }}>
            <BsInfo style={{ width: '2em', height: '2em' }} />
          </ActionIcon>
          <Title style={{ textAlign: 'center' }}>T</Title>
          <Text style={{ textAlign: 'center' }}>SUBTITLE</Text>
          <Autocomplete id='search-input' radius='md' placeholder="Search for a crime" data={crimes} limit={3} />
          <Flex style={{ justifyContent: 'center', gap: '1em' }}>
            <Button loading={loading} loaderProps={{ type: 'dots' }} radius='md' onClick={() => search((document.getElementById('search-input') as HTMLInputElement).value)}>Get Crime</Button>
            <Button loading={loading} loaderProps={{ type: 'dots' }} variant='light' radius='md' onClick={() => search(crimes[Math.floor(Math.random() * crimes.length)])}>Random Crime</Button>
          </Flex>
        </Stack>
      </Center>
      <Center style={{ position: 'absolute', left: '0', top: '0', height: '0', opacity: '0', padding: '2em', display: 'block', transition: 'all 0.25s ease-in-out' }} id='results'>
        <ActionIcon id='back-button' style={{ opacity: '0', position: 'fixed', width: '3em', height: '3em', top: '1.2em', left: '1.2em', color: 'black', border: '2px solid #ffffffdd', backgroundColor: '#ffffffaa', backdropFilter: 'blur(0.2em)', transition: 'all 0.25s ease-in-out', borderRadius: '50%' }} onClick={() => window.location.href = window.location.origin}>
          <BiArrowBack style={{ width: '2em', height: '2em' }} />
        </ActionIcon>
        <Stack style={{ width: '100%' }}>
          <Title id='results-title' style={{ textAlign: 'center' }}></Title>
          <Text id='results-reason' style={{ textAlign: 'center', color: '#00000055' }}></Text>
          <Flex id='buttons' style={{ justifyContent: 'center', gap: '1em' }}>
            <Button variant='light' leftSection={<FaMarkdown />} onClick={exportMarkdown}>Markdown</Button>
            <Button variant='light' leftSection={<BsQrCode />} onClick={async () => {
              const qr = await QRCode.toDataURL("https://crimes.benjs.uk/?s=" + document.getElementById('results-title')!.innerHTML);
              const a = document.createElement('a');
              a.href = qr;
              a.download = `${document.getElementById('results-title')!.innerHTML}-QR.png`;
              a.click();
              URL.revokeObjectURL(qr);

            }}>Share as QR</Button>
            <Button variant='light' leftSection={<BiShare />} onClick={() => window.open(`https://crimes.benjs.uk/?s=${document.getElementById('results-title')!.innerHTML}`, '_blank')}>Share</Button>
          </Flex>
          {/*<Center>
            <Button style={{ width: '28em' }} variant='light' color='pink' leftSection={<BiQuestionMark />} onClick={() => {
              const quizBox = <MantineProvider>
                <Card id="quizcard" style={{ width: '30em', height: '20em', background: 'white', borderRadius: '1em', padding: '1em', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
                  <Center style={{ height: '100%' }}>
                    <Stack>
                      <Text id="Q"></Text>
                      <Autocomplete data={crimes} limit={3} />
                      <Button>Submit</Button>
                    </Stack>
                  </Center>
                </Card>
              </MantineProvider>

              const quizContainer = document.createElement('div');
              document.body.appendChild(quizContainer);
              ReactDOM.render(quizBox, quizContainer);
            }}>Quiz</Button>
          </Center>`*/}
          <Text id='results-text'></Text>
        </Stack>
      </Center>
      <Image src='https://wikipedia.org/favicon.ico' style={{ display: 'none' }} onLoad={loaded} />
    </MantineProvider >
  )
}

export default App
