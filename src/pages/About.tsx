import Seo from "@/components/Seo";

const About = () => (
  <>
    <Seo 
      title="About Us - SilentPDF"
      description="Learn about the mission behind SilentPDF and our commitment to privacy-first, browser-based document processing."
    />

    <div className="container-px mx-auto max-w-3xl py-16 md:py-24">
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">About Us</span>
      <h1 className="mt-3 font-serif text-5xl md:text-6xl leading-tight text-balance">Privacy by default.</h1>
      
      <div className="mt-12 space-y-8 text-lg text-foreground/80 leading-relaxed">
        <p>
          SilentPDF was built on a simple premise: your documents should stay your documents. 
          In a world where every file uploaded to the cloud is at risk of being logged, indexed, 
          or monetized, we decided to take a different approach.
        </p>
        
        <h2 className="font-serif text-3xl text-foreground pt-6">How it works</h2>
        <p>
          By leveraging the power of WebAssembly and modern browser APIs, SilentPDF brings the processing 
          power directly to your device. When you merge, split, compress, or rotate a PDF on our platform, 
          the heavy lifting is done locally by your CPU and memory. 
        </p>
        <p>
          The bytes never leave your machine. There is no upload progress bar to our servers, and there is 
          no "download from the cloud" link when you're done.
        </p>

        <h2 className="font-serif text-3xl text-foreground pt-6">Our Mission</h2>
        <p>
          We believe that fast, reliable, and secure document processing should be available to everyone without 
          compromising on privacy. Our mission is to continue expanding the capabilities of client-side computing 
          so that you never have to blindly trust a third-party server with your sensitive data again.
        </p>
      </div>
    </div>
  </>
);

export default About;
