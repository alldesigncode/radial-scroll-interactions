import Scrollbar from "smooth-scrollbar";
import { gsap, Power1 } from "gsap";
import { ModalPlugin } from "./plugins/scroll-disable";
import { DATA } from "./data";

const constants = {
  SIZES: {
    MENU: {
      X: 5,
      Y: 40,
    },
  },
};

window.addEventListener("load", () => {
  const content = document.querySelector(".content");
  const scrollBar = document.querySelector(".scrollbar");
  const navContainer = [].slice.call(document.querySelectorAll(".nav > li"));
  const scrollMenu = document.querySelector(".scroll-menu");
  const side = document.querySelector(".side");

  Scrollbar.use(ModalPlugin);
  const verticalScrollbar = Scrollbar.init(content, {
    dumping: 0.1,
    delegateTo: document,
  });
  verticalScrollbar.setPosition(0, 0);
  verticalScrollbar.track.yAxis.element.remove();
  verticalScrollbar.track.xAxis.element.remove();
  verticalScrollbar.updatePluginOptions("modal", { open: true }); // disable scroll initially
  verticalScrollbar.addListener(({ offset }) => {
    const { clientHeight, scrollHeight } = verticalScrollbar.containerEl;

    // Calculate scroll progress that will increase up to 360.
    const progress = Number.parseInt(
      ((offset.y / (scrollHeight - clientHeight)) * 360).toFixed(0),
      10
    );

    // Calculate rotate percentage between the range of two values: 225 - 333.
    const rotatePercentage = ((progress * (333 - 225)) / 360 + 225).toFixed(0);

    gsap.to(scrollBar, {
      transform: `rotate(${rotatePercentage}deg)`,
    });
  });

  const initMenu = () => {
    const { X, Y } = constants.SIZES.MENU;

    gsap.to(scrollMenu, {
      delay: 0.8,
      autoAlpha: 1,
      ease: Power1.easeOut,
    });
    navContainer.forEach((navItem, index) => {
      const tl = gsap.timeline();

      tl.to(navItem, {
        transform: `translate( -${X * index}px, ${Y * index}px)`,
        duration: 0,
      })
        .to(navItem, {
          stagger: 0.2,
          delay: 0.8,
          autoAlpha: 1,
          ease: Power1.easeOut,
        })
        .then(() =>
          verticalScrollbar.updatePluginOptions("modal", { open: false })
        );

      navItem.addEventListener("click", () => {
        const scrollContent = [].slice.call(
          document.querySelector(".scroll-content").querySelectorAll(".item")
        );

        const scrollItem = scrollContent.find(
          ({ dataset }) => dataset.id === navItem.dataset.id
        );

        onMenuSelect(navItem);
        verticalScrollbar.scrollIntoView(scrollItem, {
          onlyScrollIfNeeded: true,
        });
      });
    });

    onMenuSelect(navContainer[0]);
  };

  const onMenuSelect = (selectedItem) => {
    const { X, Y } = constants.SIZES.MENU;
    toggleActive(selectedItem);

    for (const [i, navItem] of navContainer.entries()) {
      const id = Number.parseInt(selectedItem.dataset.id, 10);
      const index = i + 1;

      const currentItemYPos = gsap.getProperty(navItem, "translateY");
      const selectedItemYPos = gsap.getProperty(selectedItem, "translateY");

      const translateSteps = selectedItemYPos / Y;
      const translateValue = translateSteps * Y;

      gsap.to(navItem, {
        transform: `translate(
          ${index < id ? -(X * (id - index)) : X * (id - index)}px, 
          ${currentItemYPos - translateValue}px
        )`,
        duration: 0.8,
        ease: Power1.easeOut,
      });
    }
  };

  const toggleActive = (item) => {
    navContainer.forEach((n) => {
      if (n.dataset.id === item.dataset.id) {
        item.classList.add("active");
      } else {
        n.classList.remove("active");
      }
    });
  };

  const generateList = () => {
    const scrollContent = document.querySelector(".scroll-content");

    DATA.forEach((item) => scrollContent.appendChild(createItem(item)));

    scrollContent.classList.add(DATA.length % 2 === 0 ? "even" : "odd");

    if (scrollContent.children.length === DATA.length) {
      gsap.to(scrollContent, {
        autoAlpha: 1,
        delay: 1,
      });
    }
  };

  const createItem = (item) => {
    const itemContainer = document.createElement("div");
    const heading = document.createElement("div");
    const title = document.createElement("div");
    const order = document.createElement("span");
    const picture = document.createElement("div");

    itemContainer.classList.add("item");
    heading.classList.add("heading");
    title.classList.add("title");
    order.classList.add("order");
    picture.classList.add("picture");

    if (item.imgUrl) {
      const img = document.createElement("img");
      img.src = item.imgUrl;
      picture.appendChild(img);
    }

    title.textContent = item.title;
    order.textContent = item.id;

    heading.appendChild(title);
    heading.appendChild(order);
    itemContainer.appendChild(heading);
    itemContainer.appendChild(picture);

    if (item.hasOwnProperty("navId")) {
      itemContainer.setAttribute("data-id", item.navId);
    }

    return itemContainer;
  };

  const animateList = () => {
    gsap.to(side.children, {
      stagger: 0.15,
      delay: 1,
      y: 0,
      autoAlpha: 1,
    });
  };

  initMenu();
  generateList();
  animateList();

  let options = {
    root: verticalScrollbar.containerEl,
    rootMargin: "0px",
    threshold: 0.5,
  };

  let observer = new IntersectionObserver((entries, _) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const selection = navContainer.find(
          ({ dataset }) => dataset.id === entry.target.dataset.id
        );

        if (Boolean(selection)) {
          onMenuSelect(selection);
        }
      }
    });
  }, options);

  verticalScrollbar.containerEl.querySelectorAll(".item").forEach((p) => {
    observer.observe(p);
  });
});
