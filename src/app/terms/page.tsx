export default function PageTermsAndConditions() {
  return (
    <main className="">
      <section className="flex flex-col">
        <div className="flex flex-col items-center py-28 md:py-40 gap-5">
          <div className="overflow-hidden flex flex-col gap-5 px-10 py-5 w-[400px] md:w-full md:max-w-2xl shadow-2xl shadow-orange-600 border-4 border-black">
            <h2 className="font-burbankblack text-3xl tracking-wider text-center my-5">
              Terms and Conditions
            </h2>
            <p className="text-justify">
              Welcome to <strong>Code w/ Shayy</strong>! By accessing or using
              our website, services, or enrolling in our courses, you agree to
              comply with and be bound by the following terms and conditions.
            </p>
            <h3 className="text-lg font-extrabold">General Terms</h3>
            <div>
              <ul className="flex flex-col gap-2 list-disc">
                <li>
                  <strong>Eligibility</strong>: Our services and courses are
                  available to individuals aged 13 and older. By using our site,
                  you confirm that you meet this requirement.
                </li>
                <li>
                  <strong>Course Enrollment</strong>: Upon enrolling in a
                  course, you agree to provide accurate and complete
                  information. We reserve the right to refuse or cancel your
                  enrollment for any reason.
                </li>
              </ul>
            </div>
            <h3 className="text-lg font-extrabold">Payments and Refunds</h3>
            <div>
              <ul className="flex flex-col gap-2 list-disc">
                <li>
                  <strong>Payments</strong>: All payments must be made in full
                  at the time of course enrollment. We accept credit cards and
                  other secure payment methods.
                </li>
                <li>
                  <strong>Refund Policy</strong>: We offer refunds within 7 days
                  of enrollment, provided that you have not accessed more than
                  20% of the course material. After that, no refunds will be
                  issued.
                </li>
                <li>
                  <strong>Intellectual Property</strong>: All content provided
                  on our website, including text, graphics, code, and videos, is
                  the intellectual property of Code w/ Shayy. You may not
                  reproduce, distribute, or use any content without our prior
                  written permission. Any project code, designs, or materials
                  created by students during the course remain their own
                  intellectual property.
                </li>
              </ul>
            </div>
            <h3 className="text-lg font-extrabold">Intellectual Property</h3>
            <div>
              <ul className="flex flex-col gap-2 list-disc">
                <li>
                  All content provided on our website, including text, graphics,
                  code, and videos, is the intellectual property of Code w/
                  Shayy. You may not reproduce, distribute, or use any content
                  without our prior written permission.
                </li>
                <li>
                  Any project code, designs, or materials created by students
                  during the course remain their own intellectual property.
                </li>
              </ul>
            </div>
            <h3 className="text-lg font-extrabold">Course Access and Usage</h3>
            <div>
              <ul className="flex flex-col gap-2 list-disc">
                <li>
                  Course access is granted for personal, non-commercial use
                  only. You may not share your account or course materials with
                  others.
                </li>
                <li>
                  We reserve the right to suspend or terminate your access if we
                  detect any misuse or violation of these terms.
                </li>
              </ul>
            </div>
            <h3 className="text-lg font-extrabold">Limitation of Liability</h3>
            <div>
              <ul className="flex flex-col gap-2 list-disc">
                <li>
                  <strong>Code w/ Shayy </strong>is not liable for any indirect,
                  incidental, or consequential damages arising from your use of
                  our site or services.
                </li>
                <li>
                  While we strive to ensure the accuracy of our content, we do
                  not guarantee that our courses or materials will meet your
                  expectations or career goals.
                </li>
              </ul>
            </div>
            <h3 className="text-lg font-extrabold">Modifications to Terms</h3>
            <div>
              <p>
                We reserve the right to update or modify these terms at any
                time. Changes will be posted on this page, and it is your
                responsibility to review them regularly.
              </p>
              <p>
                By continuing to use our site or enroll in our courses, you
                agree to these updated terms.
              </p>
            </div>
          </div>
        </div>
        <p className="px-10 pb-10 text-center font-burbankmedium">
          {"If you have any questions about these Terms and Conditions, please contact us at aungminkhant.shay@gmail.com"
            .split(" ")
            .map((word, index) => (
              <b key={index} className="hover:bg-secondary">{` ${word} `}</b>
            ))}
        </p>
      </section>
    </main>
  );
}
