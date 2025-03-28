const $App = document.getElementById("App");
const $Progress = document.getElementById("Progress");
const increaseProgres = () => {
    const next = parseInt(Progress.innerText.split('/')) + 10;
    const p = next / (piBlocks.length * 10)
    Progress.innerText = `${next} / ${piBlocks.length * 10}`;
    Progress.style.background = `linear-gradient(90deg, var(--green-color) ${p * 100}%, #fff 0%)`;
};

const inputs = {
    $list: []
    , findFirstEmpty: function() {
        return this.$list.find($i => $i.value === "");
    }
    , focusNext: function($input) {
        return this.$list[$input.index + 1]?.focus();
    }
    , focusPrev: function($input) {
        return this.$list[$input.index - 1]?.focus();
    }
};

const piBlocks = (() => {
    const pi = "1415926535 8979323846 2643383279 5028841971 6939937510 5820974944 5923078164 0628620899 8628034825 3421170679 8214808651 3282306647 0938446095 5058223172 5359408128 4811174502 8410270193 8521105559 6446229489 5493038196 4428810975 6659334461 2847564823 3786783165 2712019091 4564856692 3460348610 4543266482 1339360726 0249141273 7245870066 0631558817 4881520920 9628292540 9171536436 7892590360";
    return pi.split(' ');
})();

const newInput = (() => {
    const $input = document.createElement("input");
    $input.setAttribute("placeholder", "?");
    $input.setAttribute("class", "pi-number");
    $input.setAttribute("type", "text");
    $input.setAttribute("inputmode", "numeric");
    $input.setAttribute("empty", "1");

    const handleInput = (event) => {
        const self = event.target;
        const $block = self.closest('.pi-block');

        if (self.value === '?')
            self.value = self.getAttribute("hidden-value");

        if (isNaN(parseInt(self.value.slice(-1)))) {
            self.value = "";
            return;
        }

        self.value = self.value.slice(-1);

        self.value.length > 0
            ? self.removeAttribute("empty")
            : self.setAttribute("empty", "1");


        if (self.value === self.getAttribute("hidden-value")) {
            // self.classList.add('correct');
            // self.classList.remove('incorrect');
            // self.setAttribute('disabled', '1');
            // $block.setAttribute('correct-count', $block.getAttribute('correct-count'))
            
        }

        inputs.focusNext(self);

        $block.check();
    };

    const handleKeydown = (event) => {
        if (event.key === "Enter" || event.code === "Enter")
            inputs.findFirstEmpty().focus();
        if (event.key === "Backspace" || event.key === "Delete") {
            const self = event.target;
            if (self.value === "") {
                event.preventDefault();
                inputs.focusPrev(self);
            }
        }
    };

    const AnimateCorrect = ($input, i) => {
        return new Promise(resolve => {
            setTimeout(() => {
                $input.classList.add("jumped");
                $input.classList.add("correct");
                setTimeout(() => {
                    $input.classList.remove("jumped");
                    resolve();
                }, 100);
            }, i * 50);
        });
    }

    return (value) => {
        const $newInput = $input.cloneNode(false);
        $newInput.setAttribute("hidden-value", value);
        $newInput.addEventListener("input", handleInput);
        $newInput.addEventListener("keydown", handleKeydown);
        $newInput.index = inputs.$list.length;
        $newInput.animateCorrect = () => AnimateCorrect($newInput, $newInput.index % 10);

        inputs.$list.push($newInput);
        return $newInput;
    };
})();




const CreateBlock = (() => {
    const $block = document.createElement("div");
    $block.setAttribute("class", "pi-block");

    const AnimateWrogn = ($block) => {
        return new Promise(resolve => {
            $block.classList.add("shaked");
            setTimeout(() => {
                $block.classList.remove("shaked");
                resolve();
            }, 300);
        });
    }

    const Check = ($block) => {
        const $inputsCorrect = Array.from($block.getElementsByTagName('input')).filter($i => $i.getAttribute("hidden-value") === $i.value);
        const $inputsFilled = Array.from($block.getElementsByTagName('input')).filter($i => "" !== $i.value);
        if ($inputsCorrect.length === 10) {
            
            const animations = [];
            for (const $i of $inputsCorrect) {
                $i.setAttribute("disabled", "1");
                animations.push($i.animateCorrect());
            }

            Promise.all(animations)
            .then(() => {
                $block.classList.add("correct");
                increaseProgres();
            });
        }
        else if ($inputsFilled.length === 10) {
            $block.animateWorng();
            $inputsFilled[9].focus();
        }
    }    

    return (blockData) => {
        const $newBlock = $block.cloneNode(false);
        $newBlock.check = () => Check($newBlock);
        $newBlock.animateWorng = () => AnimateWrogn($newBlock);

        for (let i = 0; i < 10; i++) {
            const $newInput = newInput(blockData[i]);
            $newBlock.appendChild($newInput);
        }

        $App.appendChild($newBlock);
    }
})();

for (let i = 0; i < piBlocks.length; i++)
    CreateBlock(piBlocks[i]);

inputs.$list[0].focus();
Progress.innerText = `0 / ${piBlocks.length * 10}`;