class JSXCompiler {
  constructor() {
    this.position = 0;
    this.input = '';
  }

  compile(html) {
    this.input = html.trim();
    this.position = 0;
    
    try {
      const result = this.parseElement();
      return result;
    } catch (error) {
      throw new Error(`JSX Compilation Error: ${error.message}`);
    }
  }

  peek(offset = 0) {
    return this.input[this.position + offset];
  }

  consume() {
    return this.input[this.position++];
  }

  skipWhitespace() {
    while (this.position < this.input.length && /\s/.test(this.peek())) {
      this.position++;
    }
  }

  parseElement() {
    this.skipWhitespace();
    
    if (this.peek() !== '<') {
      return this.parseText();
    }

    this.consume();
    
    if (this.peek() === '/') {
      throw new Error('Unexpected closing tag');
    }

    const tagName = this.parseTagName();
    const attributes = this.parseAttributes();
    
    this.skipWhitespace();
    
    if (this.peek() === '/' && this.peek(1) === '>') {
      this.consume();
      this.consume();
      return this.generateJSX(tagName, attributes, []);
    }
    
    if (this.peek() !== '>') {
      throw new Error(`Expected '>' but got '${this.peek()}'`);
    }
    this.consume();
    
    const children = this.parseChildren(tagName);
    
    return this.generateJSX(tagName, attributes, children);
  }

  parseTagName() {
    let tagName = '';
    while (this.position < this.input.length && /[a-zA-Z0-9\-]/.test(this.peek())) {
      tagName += this.consume();
    }
    return tagName;
  }

  isComponent(tagName) {
    return /^[A-Z]/.test(tagName);
  }

  parseAttributes() {
    const attributes = {};
    
    while (this.position < this.input.length) {
      this.skipWhitespace();
      
      if (this.peek() === '>' || this.peek() === '/') {
        break;
      }
      
      const attrName = this.parseAttributeName();
      if (!attrName) break;
      
      this.skipWhitespace();
      
      if (this.peek() === '=') {
        this.consume();
        this.skipWhitespace();
        
        const attrValue = this.parseAttributeValue();
        attributes[attrName] = attrValue;
      } else {
        attributes[attrName] = true;
      }
    }
    
    return attributes;
  }

  parseAttributeName() {
    let name = '';
    while (this.position < this.input.length && /[a-zA-Z0-9\-:@]/.test(this.peek())) {
      name += this.consume();
    }
    return name;
  }

  parseAttributeValue() {
    const quote = this.peek();
    
    if (quote !== '"' && quote !== "'") {
      throw new Error(`Expected quote but got '${quote}'`);
    }
    
    this.consume();
    let value = '';
    
    while (this.position < this.input.length && this.peek() !== quote) {
      value += this.consume();
    }
    
    if (this.peek() !== quote) {
      throw new Error('Unterminated attribute value');
    }
    
    this.consume();
    return value;
  }

  parseChildren(parentTag) {
    const children = [];
    
    while (this.position < this.input.length) {
      this.skipWhitespace();
      
      if (this.peek() === '<' && this.peek(1) === '/') {
        this.consume();
        this.consume();
        const closingTag = this.parseTagName();
        
        if (closingTag !== parentTag) {
          throw new Error(`Mismatched closing tag: expected </${parentTag}> but got </${closingTag}>`);
        }
        
        this.skipWhitespace();
        if (this.peek() !== '>') {
          throw new Error(`Expected '>' in closing tag`);
        }
        this.consume();
        
        break;
      }
      
      if (this.peek() === '<') {
        children.push(this.parseElement());
      } else {
        const text = this.parseText();
        if (text) {
          children.push(text);
        }
      }
    }
    
    return children;
  }

  parseText() {
    let text = '';
    
    while (this.position < this.input.length && this.peek() !== '<') {
      text += this.consume();
    }
    
    text = text.trim();
    
    if (!text) return null;
    
    return text;
  }

  generateJSX(tagName, attributes, children) {
    const isComponent = this.isComponent(tagName);
    
    const processedAttrs = {};
    Object.keys(attributes).forEach(key => {
      const value = attributes[key];
      
      let finalKey = key;
      if (!isComponent && key === 'class') {
        finalKey = 'className';
      }
      
      processedAttrs[finalKey] = value;
    });
    
    return {
      type: tagName,
      props: processedAttrs,
      children: children.filter(c => c !== null),
      isComponent
    };
  }
}

export const jsxCompiler = new JSXCompiler();