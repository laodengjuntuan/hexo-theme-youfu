// 把目录的包裹外壳放出去给用户自行定义
class Catalogue {
  constructor(target, options) {
    this.debugMode = options.debugMode || false
    this.rootMargin = options.rootMargin || '0px 0px 0px 0px'
    let elements = document.querySelectorAll("[data-spyscroll-1], [data-spyscroll-2], [data-spyscroll-3], [data-spyscroll-4], [data-spyscroll-5], [data-spyscroll-6]")
    // 扁平数据转树形结构
    let catalogueStructure = flattenToTree(elements)


    // 创建html
    let div = document.createElement('div')
    div.classList.add('scrollspy')

    let ul = createCatalogue(catalogueStructure)
    div.appendChild(ul)
    document.querySelector(target).appendChild(div)
  }

  init() {
    let options = {
      root: null,
      rootMargin: this.rootMargin,
      threshold: 1.0,
    }
    
    let lastScrollTop = document.scrollingElement.scrollTop
    const slider = document.querySelector('#slider')
    
    const targetLinks = []
    const observeSection = []
    // 目录元素添加active处理回调
    document.querySelectorAll('a[href].outline-link').forEach((item, i) => {
      observeSection.push(document.querySelector(`${ decodeURI(item.hash) }`))
      
      item.activate = () => slider.style.top = 32 * i + 'px'
      item.addEventListener('click', item.activate)
      
      targetLinks.push(item)
    
    })
    // 初始化交叉观察器
    let observer = new IntersectionObserver(handleIntersection, options)

    // 回调函数
    function handleIntersection(entries, observer) {
      entries.forEach(entry => {
        if (entry.isIntersecting) { // 进入视口时, entry.target为被监听的目标元素
          targetLinks.find(link => decodeURI(link.hash) == `#${ entry.target.id }`).activate()
        } else {  // 退出视口时
          if (document.scrollingElement.scrollTop >= lastScrollTop) { // 向下滚动

          } else { // 向上滚动
            targetLinks[targetLinks.findIndex(link => link.hash == `#${ entry.target.id }`) - 1]?.activate()
          }
        }
      })
      lastScrollTop = document.scrollingElement.scrollTop;
    }

    observeSection.forEach(section => {
      observer.observe(section)
    })
    if (this.debugMode) {
      this.debug(options)
    }
    
  }
  debug(options) {
    let rootMargin = options.rootMargin
      .split(' ')
      .map(x => Number(x.replace('px', '')))
      .map(x => Math.abs(x))
    const [ top, right, bottom, left ] = rootMargin
    
    let div = document.createElement('div')
    div.style = `width: 100vw; height: 100vh; border-color: #3451b2; border-style: solid; opacity: .5; box-sizing: border-box; position: fixed; top: 0; left: 0; border-top-width: ${ top }px; border-right-width: ${ right }px; border-bottom-width: ${ bottom }px; border-left-width: ${ left }px;z-index: 9999;`
    const body = document.querySelector('body')
    body.appendChild(div)
  }
}


function createCatalogue(catalogue, hasSlider = false) {
  let ul = document.createElement('ul')
  // 创建滑块
  if (!hasSlider) { // 递归调用时，如果有子目录就会出现多个滑块，所以当只生成一个后就不再生成
    let div = document.createElement('div')
    div.classList.add('slider')
    div.id = 'slider'
    div.style = 'top: 0;'
    ul.appendChild(div)
  }


  catalogue.forEach(item => {
    let li = document.createElement('li')
    li.appendChild(createLink('a', item.tag))
    if (item.children) {
      let ul = createCatalogue(item.children, true)
      li.appendChild(ul)
    }
    ul.appendChild(li)
  })
  return ul
}

function createLink(type, options) {
  let el = document.createElement(type)
  el.href = '#' + options.innerHTML
  el.classList.add('outline-link')
  el.innerText = options.innerHTML
  return el
}

// export { Catalogue }

/**
 * boostrap里也有大量的这种代码，把变量或者常量留在模块里，然后导出一个对象，
 * 通过对象来引入模块里的变量或常量，而不是全部东西都塞到模块里，
 * 不知道这种手法叫什么
 * 还是问chatgpt实在，这种做法叫做模块的私有变量
 * 
 * 一旦一个事情开始模块化之后，复杂度就开始上来了，需要rollup来打包，或者需要一个本地服务器来进行测试，避免本地加载HTML文件时CORS的错误
*/

let arr = ['h1', 'h2', 'h3', 'h3', 'h2', 'h3', 'h3', 'h2', 'h3', 'h3', 'h3', 'h3', 'h1', 'h2', 'h3', 'h3', 'h3', 'h3', 'h3', 'h3', 'h3', 'h3']
function flattenToTree(arr) {
  let result = []
  const stack = [{ children: result }]

  arr.forEach(tag => {
    const level = Number(tag.tagName.charAt(1))
    
    const node = {
      tag,
      children: []
    }
    // 在真正把结点压入栈之前先把栈清理干净
    while (stack.length > level) {
      stack.pop()
    }

    // 这里一定要注意顺序；
    stack[stack.length - 1].children.push(node)
    stack.push(node)
  })

  return result
}

new Catalogue('#aside', {
  debugMode: false,
  rootMargin: '-100px 0px -300px 0px'
}).init()