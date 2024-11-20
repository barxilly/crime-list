import { ActionIcon, Autocomplete, Button, Center, Flex, Image, Loader, MantineProvider, Stack, Text, Title } from '@mantine/core'
import './App.css'
import '@mantine/core/styles.css'
import wiki from 'wikipedia'
import { useState } from 'react';
import { BiArrowBack, BiShare } from 'react-icons/bi';
import { BsQrCode } from 'react-icons/bs';
import { FaMarkdown } from 'react-icons/fa';
import TurndownService from 'turndown';
import ReactDOM from 'react-dom';
import QRCode from 'qrcode'

function App() {
  const [loading, setLoading] = useState(false);

  let crimes = [
    '2005 London bombings',
    '7/7',
    'Jimmy Savile sexual abuse scandal',
    'Murder of James Bulger',
    'Murder of Sarah Payne',
    'Murder of Sarah Everard',
    'Murder of Stephen Lawrence',
    'Murder of Rachel Nickell',
    'Clare\'s Law',
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
    const results = await wiki.html(value);
    const title = value
    const text = results
    console.log(results)
    document.getElementById('results-title')!.innerHTML = title;
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
          <Title style={{ textAlign: 'center' }}>TITLE</Title>
          <Text style={{ textAlign: 'center' }}>SUBTITLE</Text>
          <Autocomplete id='search-input' radius='md' placeholder="Search for a crime" data={crimes} limit={3} />
          <Flex style={{ justifyContent: 'center', gap: '1em' }}>
            <Button loading={loading} loaderProps={{ type: 'dots' }} radius='md' onClick={() => search((document.getElementById('search-input') as HTMLInputElement).value)}>Get Crime</Button>
            <Button loading={loading} loaderProps={{ type: 'dots' }} variant='light' radius='md' onClick={() => search(crimes[Math.floor(Math.random() * crimes.length)])}>Random Crime</Button>
          </Flex>
        </Stack>
      </Center>
      <Center style={{ position: 'absolute', left: '0', top: '0', height: '0', opacity: '0', padding: '2em', display: 'block', transition: 'all 0.25s ease-in-out' }} id='results'>
        <ActionIcon id='back-button' style={{ opacity: '0', position: 'fixed', width: '3em', height: '3em', top: '1.2em', left: '1.2em', color: 'black', border: '2px solid #ffffffdd', backgroundColor: '#ffffffaa', backdropFilter: 'blur(0.2em)', transition: 'all 0.25s ease-in-out', borderRadius: '50%' }} onClick={() => window.location.reload()}>
          <BiArrowBack style={{ width: '2em', height: '2em' }} />
        </ActionIcon>
        <Stack style={{ width: '100%' }}>
          <Title id='results-title' style={{ textAlign: 'center' }}></Title>
          <Flex id='buttons' style={{ justifyContent: 'center', gap: '1em' }}>
            <Button variant='light' leftSection={<FaMarkdown />} onClick={exportMarkdown}>Markdown</Button>
            <Button variant='light' leftSection={<BsQrCode />} onClick={async () => {
              const qr = await QRCode.toDataURL("http://localhost:5173/?s=" + document.getElementById('results-title')!.innerHTML);
              const a = document.createElement('a');
              a.href = qr;
              a.download = `${document.getElementById('results-title')!.innerHTML}-QR.png`;
              a.click();
              URL.revokeObjectURL(qr);

            }}>Share as QR</Button>
            <Button variant='light' leftSection={<BiShare />} onClick={() => window.open(`http://localhost:5173/?s=${document.getElementById('results-title')!.innerHTML}`, '_blank')}>Share</Button>
          </Flex>
          <Text id='results-text'></Text>
        </Stack>
      </Center>
      <Image src='https://wikipedia.org/favicon.ico' style={{ display: 'none' }} onLoad={loaded} />
    </MantineProvider >
  )
}

export default App
