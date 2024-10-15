export default function PagePrivacyPolicy() {
  return (
    <main className="">
      <section className="flex flex-col">
        <div className="flex flex-col items-center py-28 md:py-40 gap-5">
          <div className="overflow-hidden flex flex-col gap-5 px-10 py-5 w-[350px] md:w-full md:max-w-2xl shadow-2xl shadow-orange-600 border-4 border-black">
            <h2 className="font-burbankblack text-3xl tracking-wider text-center my-5">
              Privacy Policy
            </h2>
            <p className="text-justify">
              At <strong>Code w/ Shayy</strong>, we are committed to protecting
              your privacy and ensuring the security of your personal
              information. This Privacy Policy outlines how we collect, use, and
              safeguard your data when you visit our website, enroll in our
              courses, or interact with us in any way.
            </p>
            <h3 className="text-lg font-extrabold">Information We Collect</h3>
            <div>
              <ul className="list-disc flex flex-col gap-2">
                <li>
                  <strong>Personal Information</strong>: When you sign up for
                  courses or contact us, we collect information such as your
                  name, email address, phone number, and payment details.
                </li>
                <li>
                  <strong>Usage Data</strong>: We collect non-personal data,
                  such as your IP address, browser type, and browsing behavior
                  on our site, to improve our services and user experience.
                </li>
                <li>
                  <strong>Cookies</strong>: Our site uses cookies to remember
                  your preferences and improve functionality. You can choose to
                  disable cookies in your browser settings.
                </li>
              </ul>
            </div>
            <h3 className="text-lg font-extrabold">
              How We Use Your Information
            </h3>
            <div>
              <ul className="list-disc flex flex-col gap-2">
                <li>
                  To provide and manage our services, including course
                  enrollment and customer support.
                </li>
                <li>
                  To communicate with you regarding updates, new courses, or
                  promotional offers.
                </li>
                <li>
                  To improve our website and services by analyzing usage data.
                </li>
                <li>To process payments securely.</li>
              </ul>
            </div>
            <h3 className="text-lg font-extrabold">Data Sharing</h3>
            <p>
              We do not sell, rent, or trade your personal information to third
              parties. However, we may share your data with trusted service
              providers who assist us in operating our business, such as payment
              processors or email marketing platforms.
            </p>
            <h3 className="text-lg font-extrabold">Data Security</h3>
            <p>
              We take reasonable steps to protect your information from
              unauthorized access, alteration, or disclosure. However, no
              internet transmission is 100% secure, and we cannot guarantee
              absolute security.
            </p>
            <h3 className="text-lg font-extrabold">Your Rights</h3>
            <p>
              You have the right to access, modify, or delete your personal
              information at any time. If you wish to exercise these rights,
              please contact us at our email described below.
            </p>
            <h3 className="text-lg font-extrabold">Changes to this Policy</h3>
            <p>
              We may update this Privacy Policy from time to time. Any changes
              will be posted on this page, and the effective date will be
              updated accordingly.
            </p>
          </div>
        </div>
        <p className="px-10 pb-10 text-center font-burbankmedium">
          {"If you have any questions about our Privacy Policy, please contact us at our email."
            .split(" ")
            .map((word, index) => (
              <b key={index} className="hover:bg-secondary">{` ${word} `}</b>
            ))}
        </p>
      </section>
    </main>
  );
}
